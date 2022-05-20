import { NextFunction, Request, Response } from "express";
import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

import { logger, createAndLogErrorRequest } from "../utils/logger";
import { CHECK_YOUR_ANSWERS_URL, CONFIRMATION_URL, PAYMENT_PAID } from "../config";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { OverseasEntityKey, PaymentKey } from "../model/data.types.model";

// The Payment Platform will redirect the user's browser back to the `redirectUri` supplied when the payment session was created,
// and this controller is dealing with the completion of the payment journey
export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, state } = req.query;

    const appData: ApplicationData = getApplicationData(req.session);
    const savedPayment = appData[PaymentKey] || {} as CreatePaymentRequest;

    logger.debugRequest(req, `Returned state: ${ state }, saved state: ${savedPayment.state}`);

    // The application must ensure that the returned `state` matches the nonce
    // sent by the application to the Payment Platform. Protection against CSRF
    if ( !savedPayment.state || savedPayment.state !== state) {
      return next(createAndLogErrorRequest(req, `Rejecting payment redirect, payment state does not match. Payment Request: ${ JSON.stringify(savedPayment)}`));
    }

    // Validate the status of the payment
    if (status === PAYMENT_PAID) {
      logger.debugRequest(req, `Overseas Entity id: ${ appData[OverseasEntityKey] }, Payment status: ${status}, Redirecting to: ${CONFIRMATION_URL}`);

      // Payment Successful, redirect to confirmation page
      return res.redirect(CONFIRMATION_URL);
    } else {
      logger.debugRequest(req, `Overseas Entity id: ${ appData[OverseasEntityKey] }, Payment status: ${status}, Redirecting to: ${CHECK_YOUR_ANSWERS_URL}`);

      // Dealing with failures payment (User cancelled, Insufficient funds, Payment error ...)
      // Redirect to CHECK_YOUR_ANSWERS. Try again eventually
      return res.redirect(CHECK_YOUR_ANSWERS_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
