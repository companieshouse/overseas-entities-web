import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { IsSecureRegisterKey } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SECURE_REGISTER_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    const notLiveTitle: string = "(NOT LIVE)";
    return res.render(config.SECURE_REGISTER_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.SECURE_REGISTER_FILTER_PAGE,
      [IsSecureRegisterKey]: appData[IsSecureRegisterKey],
      notLiveTitle
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
      return res.redirect(config.UPDATE_USE_PAPER_URL);
    } else if (isSecureRegister === '0') {
      return res.redirect(config.OVERSEAS_ENTITY_QUERY_PAGE);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
