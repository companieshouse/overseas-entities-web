import { NextFunction, Request, Response } from "express";
import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import { isActiveFeature } from "../utils/feature.flag";
import { ApplicationData } from "../model";
import { fetchApplicationData } from "../utils/application.data";
import { getCacheKeyForPaymentRef } from "../service/payment.service";
import { logger, createAndLogErrorRequest } from "../utils/logger";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";

import {
  PaymentKey,
  Transactionkey,
  OverseasEntityKey,
} from "../model/data.types.model";

import {
  PAYMENT_PAID,
  CONFIRMATION_URL,
  CONFIRMATION_PAGE,
  PAYMENT_FAILED_URL,
  PAYMENT_FAILED_PAGE,
  ROUTE_PARAM_SUBMISSION_ID,
  ROUTE_PARAM_TRANSACTION_ID,
  ACTIVE_SUBMISSION_BASE_PATH,
  ROUTE_PARAM_OVERSEAS_ENTITY_ID,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
} from "../config";

// The Payment Platform will redirect the user's browser back to the `redirectUri` supplied when the payment session was created,
// and this controller is dealing with the completion of the payment journey
export const get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

  try {

    const { status, state } = req.query;
    req.params[ROUTE_PARAM_SUBMISSION_ID] = req.params[ROUTE_PARAM_SUBMISSION_ID] ?? req.params[ROUTE_PARAM_OVERSEAS_ENTITY_ID];
    const transactionId = req.params[ROUTE_PARAM_TRANSACTION_ID];
    const submissionId = req.params[ROUTE_PARAM_SUBMISSION_ID];
    const appData: ApplicationData = await fetchApplicationData(req, true);
    let savedPayment = appData[PaymentKey] || {} as CreatePaymentRequest;
    let cacheKey: string = "";

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      logger.info(`Fetching payment reference from cache for transactionId: ${transactionId} and submissionId: ${submissionId}`);
      cacheKey = getCacheKeyForPaymentRef(transactionId, submissionId);
      savedPayment = req.session?.getExtraData(cacheKey) as CreatePaymentRequest;
    }

    logger.infoRequest(req, `Returned state: ${ state }, saved state: ${savedPayment.state}, with status: ${ status }`);

    // The application must ensure that the returned `state` matches the nonce
    // sent by the application to the Payment Platform. Protection against CSRF
    if (!savedPayment.state || savedPayment.state !== state) {
      return next(createAndLogErrorRequest(req, `Rejecting payment redirect, payment state does not match. Payment Request: ${ JSON.stringify(savedPayment)}`));
    }

    let paymentConfirmationUrl = CONFIRMATION_URL;
    let paymentFailureUrl = PAYMENT_FAILED_URL;

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      const basePath = getUrlWithTransactionIdAndSubmissionId(ACTIVE_SUBMISSION_BASE_PATH, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
      paymentConfirmationUrl = REGISTER_AN_OVERSEAS_ENTITY_URL + basePath + CONFIRMATION_PAGE;
      paymentFailureUrl = REGISTER_AN_OVERSEAS_ENTITY_URL + basePath + PAYMENT_FAILED_PAGE;
      logger.info(`Deleting payment reference from cache for transactionId: ${transactionId} and submissionId: ${submissionId}`);
      req.session?.deleteExtraData(cacheKey);
    }

    if (status === PAYMENT_PAID) {
      logger.debugRequest(req, `Overseas Entity id: ${appData[OverseasEntityKey]}, Payment status: ${status}, Redirecting to: ${paymentConfirmationUrl}`);
      return res.redirect(paymentConfirmationUrl);
    } else {
      // Dealing with failures payment (User cancelled, Insufficient funds, Payment error ...)
      logger.debugRequest(req, `Overseas Entity id: ${appData[OverseasEntityKey]}, Payment status: ${status}, Redirecting to: ${paymentFailureUrl}`);
      return res.redirect(paymentFailureUrl);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
