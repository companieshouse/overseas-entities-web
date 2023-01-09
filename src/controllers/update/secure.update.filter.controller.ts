import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";

import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { IsSecureUpdateKey } from "../../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SECURE_UPDATE_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.SECURE_UPDATE_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.SECURE_UPDATE_FILTER_PAGE,
      [IsSecureUpdateKey]: appData[IsSecureUpdateKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SECURE_UPDATE_FILTER_PAGE}`);
    const isSecureUpdate = req.body[IsSecureUpdateKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [IsSecureUpdateKey]: isSecureUpdate });

    if (isSecureUpdate === '1') {
      return res.redirect(config.USE_PAPER_URL);
    } else if (isSecureUpdate === '0') {
      return res.redirect(config.OVERSEAS_ENTITY_QUERY_PAGE);
    }

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
