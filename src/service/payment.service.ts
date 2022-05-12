import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CreatePaymentRequest, Payment } from "@companieshouse/api-sdk-node/dist/services/payment";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import { createOAuthApiClient } from "./api.service";
import * as config from "../config";

const PAYMENT_ENABLED = true;

export const startPaymentsSession = async ( req: Request, session: Session, transactionId: string, overseasEntityId: string, transactionRes ): Promise<string> => {

  const paymentUrl = transactionRes.headers?.[config.PAYMENT_REQUIRED];

  if (paymentUrl && PAYMENT_ENABLED) {
    const paymentResourceUri: string = `/transactions/${transactionId}/payment`;

    const createPaymentRequest: CreatePaymentRequest = {
      redirectUri: "", // redirectUri,
      reference: `${config.REFERENCE}_${overseasEntityId}`,
      resource: config.API_URL + paymentResourceUri,
      state: "" // state,
    };

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
    return config.CONFIRMATION_URL;
  }
};
