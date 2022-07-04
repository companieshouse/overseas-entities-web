import { Request, Response, NextFunction } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";
import { IsSecureRegisterKey } from "../model/data.types.model";

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

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SECURE_REGISTER_FILTER_PAGE}`);
    const isSecureRegister = req.body[IsSecureRegisterKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [IsSecureRegisterKey]: isSecureRegister });

    if (isSecureRegister === '1') {
      return res.redirect(config.USE_PAPER_URL);
    } else if (isSecureRegister === '0') {
      return res.redirect(config.INTERRUPT_CARD_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
