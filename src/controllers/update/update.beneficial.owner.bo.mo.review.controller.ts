import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const backLinkUrl = config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    return res.render(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE, {
      backLinkUrl: backLinkUrl,
      templateName: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
      appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
