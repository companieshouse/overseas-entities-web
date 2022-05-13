import { Request } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import { createOAuthApiClient } from "./api.service";
import { PaymentKey } from "../model/payment.type.model";
import { setApplicationData } from "../utils/application.data";
import {
  PAYMENT_REQUIRED_HEADER,
  REFERENCE,
  API_URL,
  CHS_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  PAYMENT,
  TRANSACTION,
  OVERSEAS_ENTITY,
  CONFIRMATION_URL
} from "../config";

const PAYMENT_ENABLED = true;

export const startPaymentsSession = async (
  req: Request, session: Session, transactionId: string, overseasEntityId: string, transactionRes
): Promise<string> => {

  const paymentUrl = transactionRes.headers?.[PAYMENT_REQUIRED_HEADER];

  if (paymentUrl && PAYMENT_ENABLED) {
    const createPaymentRequest: CreatePaymentRequest = setPaymentRequest(transactionId, overseasEntityId);

    setApplicationData(session, { ...createPaymentRequest, transactionId, overseasEntityId }, PaymentKey);

    const apiClient: ApiClient = createOAuthApiClient(session, paymentUrl);
    const paymentResult = await apiClient.payment.createPaymentWithFullUrl(createPaymentRequest);

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
        status_code=${paymentResult.value.httpStatusCode},
        status=${paymentResource.status},
        links=${JSON.stringify(paymentResource.links)}`
      );
      return paymentResource.links.journey;
    }
  } else {
    return CONFIRMATION_URL;
  }
};

const setPaymentRequest = (transactionId, overseasEntityId): CreatePaymentRequest => {
  const reference = `${REFERENCE}_${overseasEntityId}`;
  const paymentResourceUri = `${API_URL}/transactions/${transactionId}/${PAYMENT}`;
  const baseURL = `${CHS_URL}${REGISTER_AN_OVERSEAS_ENTITY_URL}`;
  const redirectUri = `${baseURL}${TRANSACTION}/${transactionId}/${OVERSEAS_ENTITY}/${overseasEntityId}`;

  return {
    resource: paymentResourceUri,
    state: uuidv4(),
    redirectUri,
    reference
  };
};
