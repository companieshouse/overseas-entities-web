import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE, {
      // TODO temporary PAGE for testing, remove afterwards
      backLinkUrl: config.OVERSEAS_ENTITY_REVIEW_PAGE,

      // the below backLinkUrl is Josh's new page and will become the previous page to this one
      // backLinkUrl: config. UPDATE_REGISTRABLE_BENEFICIAL_OWNER_PAGE,
      templateName: config.BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
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

    return res.redirect(config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
