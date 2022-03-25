import { NextFunction, Request, Response } from "express";

import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, presenterType } from "../model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET PRESENTER_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.PRESENTER_PAGE, {
      backLinkUrl: config.LANDING_URL,
      ...appData.presenter
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST PRESENTER_PAGE`);

    const data = prepareData(req.body, presenterType.PresenterKeys);
    setApplicationData(req.session, data, presenterType.PresenterKey);

    return res.redirect(config.ENTITY_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
