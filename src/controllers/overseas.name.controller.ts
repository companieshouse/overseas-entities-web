import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { EntityNameKey } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_NAME_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_NAME_PAGE, {
      backLinkUrl: config.INTERRUPT_CARD_URL,
      templateName: config.OVERSEAS_NAME_PAGE,
      [EntityNameKey]: appData?.[EntityNameKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_NAME_PAGE}`);
    const entityName = req.body[EntityNameKey];

    setExtraData(req.session, {
      ...getApplicationData(req.session),
      [EntityNameKey]: entityName
    });

    return res.redirect(config.PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
