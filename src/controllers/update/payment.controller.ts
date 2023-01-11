import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { PaymentKey } from "../../model/data.types.model";
import { CreatePaymentRequest } from "@companieshouse/api-sdk-node/dist/services/payment";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, state } = req.query;

    const appData: ApplicationData = getApplicationData(req.session);
    const savedPayment = appData[PaymentKey] || {} as CreatePaymentRequest;

    logger.infoRequest(req, `Returned state: ${ state }, saved state: ${savedPayment.state}, with status: ${ status }`);

    if (status === config.PAYMENT_PAID){
      return res.redirect(config.UPDATE_CONFIRMATION_URL);
    } else {
      return res.redirect(config.UPDATE_CHECK_YOUR_ANSWERS_URL);
    }
  } catch (error){
    logger.errorRequest(req, error);
    next(error);
  }
};
