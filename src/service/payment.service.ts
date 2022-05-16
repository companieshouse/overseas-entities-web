import { Request } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import { createOAuthApiClient } from "./api.service";
import { PaymentKey } from "../model/payment.type.model";
import { setApplicationData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import {
  PAYMENT_REQUIRED_HEADER,
  REFERENCE,
  API_URL,
  CHS_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  PAYMENT,
  TRANSACTION,
  OVERSEAS_ENTITY,
  CONFIRMATION_URL,
  FEATURE_FLAG_PAYMENT
} from "../config";

export const startPaymentsSession = async (
  req: Request, session: Session, transactionId: string, overseasEntityId: string, transactionRes
): Promise<string> => {

  const paymentUrl = transactionRes.headers?.[PAYMENT_REQUIRED_HEADER];

  // If the transaction response is fee-bearing, a `X-Payment-Required` header will be received,
  // directing the application to the Payment Platform to begin a payment session
  if (isActiveFeature(FEATURE_FLAG_PAYMENT) && paymentUrl) {
    const createPaymentRequest: CreatePaymentRequest = setPaymentRequest(transactionId, overseasEntityId);

    // Save info into the session extra data field, including the state used as `nonce` against CSRF.
    setApplicationData(session, { ...createPaymentRequest, transactionId, overseasEntityId }, PaymentKey);

    // Create Payment Api Client by using the `paymentUrl` as baseURL
    const apiClient: ApiClient = createOAuthApiClient(session, paymentUrl);

    // Calls the platform to create a payment session
    const paymentResult = await apiClient.payment.createPaymentWithFullUrl(createPaymentRequest);

    // Verify the state of the payment, success or failure (eg. cost not found, connection issues ...)
    if (paymentResult.isFailure()) {
      const errorResponse = paymentResult.value;

      const description = `
        payment.service failure to create payment, 
        http response status code = ${ errorResponse?.httpStatusCode || "No Status Code found in response" },
        http errors response = ${ JSON.stringify(errorResponse?.errors || "No Errors found in response") }
      `;

      throw createAndLogErrorRequest(req, description);
    } else if (!paymentResult.value?.resource) {
      throw createAndLogErrorRequest(req, "No resource in payment response");
    } else {
      const paymentResource = paymentResult.value.resource as Payment;

      logger.infoRequest(req, `
        Create payment,
        status_code= ${ paymentResult.value.httpStatusCode },
        status= ${ paymentResource.status },
        links= ${ JSON.stringify(paymentResource.links ) }
      `);

      // To initiate the web journey through which the user will interact to make the payment
      return paymentResource.links.journey;
    }
  } else {
    // Only if transaction does not have a fee or PAYMENT flagged.
    return CONFIRMATION_URL;
  }
};

const setPaymentRequest = (transactionId, overseasEntityId): CreatePaymentRequest => {

  const paymentResourceUri = `${API_URL}/transactions/${transactionId}/${PAYMENT}`;

  const baseURL = `${CHS_URL}${REGISTER_AN_OVERSEAS_ENTITY_URL}`;
  const reference = `${REFERENCE}_${transactionId}`;

  // Once payment has been taken, the platform redirects the user back to the application,
  // using the application supplied `redirectUri`.
  const redirectUri = `${baseURL}${TRANSACTION}/${transactionId}/${OVERSEAS_ENTITY}/${overseasEntityId}/${PAYMENT}`;

  return {
    resource: paymentResourceUri,
    state: uuidv4(),
    redirectUri,
    reference
  };
};
