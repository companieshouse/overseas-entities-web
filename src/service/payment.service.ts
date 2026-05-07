import { Request } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { isActiveFeature } from "../utils/feature.flag";
import { ApplicationData } from "../model";
import { createAndLogErrorRequest, logger } from "../utils/logger";
import { createOAuthApiClient } from "./api.service";

import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";

import {
  PaymentKey,
  Transactionkey,
  OverseasEntityKey,
} from "../model/data.types.model";

import {
  setExtraData,
  setApplicationData,
  fetchApplicationData,
} from "../utils/application.data";

import {
  isRemoveJourney,
  getUrlWithParamsToPath,
} from "../utils/url";

import {
  API_URL,
  CHS_URL,
  REFERENCE,
  PAYMENT,
  TRANSACTION,
  OVERSEAS_ENTITY,
  CONFIRMATION_URL,
  PAYMENT_REQUIRED_HEADER,
  CONFIRMATION_WITH_PARAMS_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
} from "../config";

// If the transaction response is fee-bearing, a `X-Payment-Required` header will be received,
// directing the application to the Payment Platform to begin a payment session, otherwise
// will return the CONFIRMATION URL.
export const startPaymentsSession = async (
  req: Request,
  session: Session,
  transactionId: string,
  overseasEntityId: string,
  transactionRes,
  baseURL?: string
): Promise<string> => {

  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = {
    ...(await fetchApplicationData(req, isRemove, true)),
    [Transactionkey]: transactionId,
    [OverseasEntityKey]: overseasEntityId
  };

  setExtraData(session, appData);

  const paymentUrl = transactionRes.headers?.[PAYMENT_REQUIRED_HEADER];

  if (!paymentUrl) {
    // Only if transaction does not have a fee
    let confirmationPageUrl = CONFIRMATION_URL;
    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      confirmationPageUrl = getUrlWithParamsToPath(CONFIRMATION_WITH_PARAMS_URL, req);
    }
    return confirmationPageUrl;
  }

  const createPaymentRequest: CreatePaymentRequest = setPaymentRequest(req, transactionId, overseasEntityId, baseURL);

  // Save app data including the state used as `nonce` against CSRF.
  if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
    await setApplicationData(req, createPaymentRequest, PaymentKey);
  } else {
    await setApplicationData(session, createPaymentRequest, PaymentKey);
  }

  // Create Payment Api Client by using the `paymentUrl` as baseURL
  const apiClient: ApiClient = createOAuthApiClient(session, paymentUrl);

  // Calls the platform to create a payment session
  const paymentResult = await apiClient.payment.createPaymentWithFullUrl(createPaymentRequest);

  // Verify the state of the payment, success or failure (eg. cost not found, connection issues ...)
  if (paymentResult.isFailure()) {
    const errorResponse = paymentResult.value;
    const msgErrorStatusCode = `http response status code=${ errorResponse?.httpStatusCode || "No Status Code found in response" }`;
    const msgErrorResponse = `http errors response=${ JSON.stringify(errorResponse?.errors || "No Errors found in response") }`;
    const msgError = `payment.service failure to create payment, ${msgErrorStatusCode}, ${msgErrorResponse}.`;

    throw createAndLogErrorRequest(req, msgError);

  } else if (!paymentResult.value?.resource) {
    throw createAndLogErrorRequest(req, "No resource in payment response");
  } else {
    const paymentResource: Payment = paymentResult.value.resource;
    logger.infoRequest(req, `Create payment, status_code=${ paymentResult.value.httpStatusCode }, status=${ paymentResource.status }, links= ${ JSON.stringify(paymentResource.links ) } `);

    // To initiate the web journey through which the user will interact to make the payment
    return paymentResource.links.journey;
  }
};

const setPaymentRequest = (req: Request, transactionId: string, overseasEntityId: string, baseUrl?: string): CreatePaymentRequest => {

  const paymentResourceUri = `${API_URL}/transactions/${transactionId}/${PAYMENT}`;
  const reference = `${REFERENCE}_${transactionId}`;

  if (!baseUrl) {
    baseUrl = `${CHS_URL}${REGISTER_AN_OVERSEAS_ENTITY_URL}`;
  }

  // Once payment has been taken, the platform redirects the user back to the application via the redirectUri endpoint
  const redirectUri = `${baseUrl}${TRANSACTION}/${transactionId}/${OVERSEAS_ENTITY}/${overseasEntityId}/${PAYMENT}`;

  return {
    resource: paymentResourceUri,
    state: uuidv4(),
    redirectUri,
    reference
  };
};
