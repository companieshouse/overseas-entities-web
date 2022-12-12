import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { OVERSEAS_NAME } from "../model/data.types.model";
import { getApplicationData, setExtraData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_NAME_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_NAME_PAGE, {
      backLinkUrl: config.INTERRUPT_CARD_URL,
      templateName: config.OVERSEAS_NAME_PAGE,
      [OVERSEAS_NAME]: appData?.[OVERSEAS_NAME]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_NAME_PAGE}`);
    const overseasName = req.body[OVERSEAS_NAME];

    setExtraData(req.session, {
      ...getApplicationData(req.session),
      [OVERSEAS_NAME]: overseasName
    });

    return res.redirect(config.PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
