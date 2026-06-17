import { Request, Response, NextFunction } from "express";
import { isActiveFeature } from "../../utils/feature.flag";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import { getUrlWithTransactionIdAndSubmissionId } from "../../utils/url";
import { OverseasEntityKey, PaymentKey, Transactionkey } from "../../model/data.types.model";
import {
  PAYMENT_PAID,
  PAYMENT_FAILED_PAGE,
  UPDATE_CONFIRMATION_URL,
  UPDATE_CONFIRMATION_PAGE,
  UPDATE_PAYMENT_FAILED_URL,
  ROUTE_PARAM_SUBMISSION_ID,
  ACTIVE_SUBMISSION_BASE_PATH,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  ROUTE_PARAM_OVERSEAS_ENTITY_ID,
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
} from "../../config";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const { status, state } = req.query;
    req.params[ROUTE_PARAM_SUBMISSION_ID] = req.params[ROUTE_PARAM_SUBMISSION_ID] ?? req.params[ROUTE_PARAM_OVERSEAS_ENTITY_ID];
    const appData: ApplicationData = await getApplicationData(req, true);
    const savedPayment = appData[PaymentKey] || {} as CreatePaymentRequest;

    logger.infoRequest(req, `Returned state: ${ state }, saved state: ${savedPayment.state}, with status: ${ status }`);

    if (!savedPayment.state || savedPayment.state !== state) {
      return next(createAndLogErrorRequest(req, `Rejecting update payment redirect, payment state does not match. Payment Request: ${ JSON.stringify(savedPayment)}`));
    }

    let updatePaymentCompletedUrl = UPDATE_CONFIRMATION_URL;
    let updatePaymentFailedUrl = UPDATE_PAYMENT_FAILED_URL;

    if (isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL)) {
      const basePath = getUrlWithTransactionIdAndSubmissionId(ACTIVE_SUBMISSION_BASE_PATH, appData[Transactionkey] as string, appData[OverseasEntityKey] as string);
      updatePaymentCompletedUrl = UPDATE_AN_OVERSEAS_ENTITY_URL + basePath + UPDATE_CONFIRMATION_PAGE;
      updatePaymentFailedUrl = UPDATE_AN_OVERSEAS_ENTITY_URL + basePath + PAYMENT_FAILED_PAGE;
    }

    if (status === PAYMENT_PAID) {
      logger.debugRequest(req, `Overseas Entity id: ${appData[OverseasEntityKey]}, Payment status: ${status}, Redirecting to: ${updatePaymentCompletedUrl}`);
      return res.redirect(updatePaymentCompletedUrl);
    } else {
      logger.debugRequest(req, `Overseas Entity id: ${appData[OverseasEntityKey]}, Payment status: ${status}, Redirecting to: ${updatePaymentFailedUrl}`);
      return res.redirect(updatePaymentFailedUrl);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
