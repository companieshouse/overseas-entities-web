import { Request, Response, NextFunction } from "express";
import { Session } from "@companieshouse/node-session-handler";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { IsSecureRegisterKey, Transactionkey } from "../model/data.types.model";
import { isActiveFeature } from "../utils/feature.flag";
import { postTransaction } from "../service/transaction.service";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SECURE_REGISTER_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.SECURE_REGISTER_FILTER_PAGE, {
      backLinkUrl: config.SOLD_LAND_FILTER_URL,
      templateName: config.SECURE_REGISTER_FILTER_PAGE,
      [IsSecureRegisterKey]: appData[IsSecureRegisterKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SECURE_REGISTER_FILTER_PAGE}`);

    const isSecureRegister = req.body[IsSecureRegisterKey];
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);

    setExtraData(req.session, { ...appData, [IsSecureRegisterKey]: isSecureRegister });

    if (isSecureRegister === '1') {
      return res.redirect(config.USE_PAPER_URL);
    } else if (isSecureRegister === '0') {
      if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022) && !appData[Transactionkey]) {
        appData[Transactionkey] = await postTransaction(req, session);
      }
      return res.redirect(config.INTERRUPT_CARD_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
