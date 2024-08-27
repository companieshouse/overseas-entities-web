import { NextFunction, Request, Response } from "express";
import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

import { logger, createAndLogErrorRequest } from "../utils/logger";
import {
  CONFIRMATION_URL,
  CONFIRMATION_WITH_PARAMS_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  PAYMENT_FAILED_URL,
  PAYMENT_FAILED_WITH_PARAMS_URL,
  PAYMENT_PAID
} from "../config";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { OverseasEntityKey, PaymentKey } from "../model/data.types.model";
import { isActiveFeature } from "../utils/feature.flag";
import { getUrlWithParamsToPath } from "../utils/url";

// The Payment Platform will redirect the user's browser back to the `redirectUri` supplied when the payment session was created,
// and this controller is dealing with the completion of the payment journey
export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, state } = req.query;

    const appData: ApplicationData = await getApplicationData(req.session);
    const savedPayment = appData[PaymentKey] || {} as CreatePaymentRequest;

    logger.infoRequest(req, `Returned state: ${ state }, saved state: ${savedPayment.state}, with status: ${ status }`);

    // The application must ensure that the returned `state` matches the nonce
    // sent by the application to the Payment Platform. Protection against CSRF
    if ( !savedPayment.state || savedPayment.state !== state) {
      return next(createAndLogErrorRequest(req, `Rejecting payment redirect, payment state does not match. Payment Request: ${ JSON.stringify(savedPayment)}`));
    }

    // Validate the status of the payment
    if (status === PAYMENT_PAID) {

      let confirmationPageUrl = CONFIRMATION_URL;
      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {

        confirmationPageUrl = getUrlWithParamsToPath(CONFIRMATION_WITH_PARAMS_URL, req);
      }

      logger.debugRequest(req, `Overseas Entity id: ${ appData[OverseasEntityKey] }, Payment status: ${status}, Redirecting to: ${confirmationPageUrl}`);

      // Payment Successful, redirect to confirmation page
      return res.redirect(confirmationPageUrl);
    } else {
      // Dealing with failures payment (User cancelled, Insufficient funds, Payment error ...)
      logger.debugRequest(req, `Overseas Entity id: ${ appData[OverseasEntityKey] }, Payment status: ${status}, Redirecting to: ${PAYMENT_FAILED_URL}`);
      let nextPageUrl = PAYMENT_FAILED_URL;
      if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)){
        nextPageUrl = getUrlWithParamsToPath(PAYMENT_FAILED_WITH_PARAMS_URL, req);
      }
      return res.redirect(nextPageUrl);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
