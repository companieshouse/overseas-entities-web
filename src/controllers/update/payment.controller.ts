import { Request, Response, NextFunction } from "express";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { OverseasEntityKey, PaymentKey } from "../../model/data.types.model";
import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, state } = req.query;
    const appData: ApplicationData = await getApplicationData(req.session);
    const savedPayment = appData[PaymentKey] || {} as CreatePaymentRequest;

    logger.infoRequest(req, `Returned state: ${ state }, saved state: ${savedPayment.state}, with status: ${ status }`);
    if (!savedPayment.state || savedPayment.state !== state) {
      return next(createAndLogErrorRequest(req, `Rejecting update payment redirect, payment state does not match. Payment Request: ${ JSON.stringify(savedPayment)}`));
    }

    if (status === config.PAYMENT_PAID) {
      logger.debugRequest(req, `Overseas Entity id: ${ appData[OverseasEntityKey] }, Payment status: ${status}, Redirecting to: ${config.UPDATE_CONFIRMATION_URL}`);
      return res.redirect(config.UPDATE_CONFIRMATION_URL);
    } else {
      logger.debugRequest(req, `Overseas Entity id: ${ appData[OverseasEntityKey] }, Payment status: ${status}, Redirecting to: ${config.UPDATE_PAYMENT_FAILED_URL}`);
      return res.redirect(config.UPDATE_PAYMENT_FAILED_URL);
    }
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};
