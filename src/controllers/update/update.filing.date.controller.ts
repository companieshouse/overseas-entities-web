import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(config.UPDATE_FILING_DATE_PAGE, {
      backLinkUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.UPDATE_FILING_DATE_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(config.OVERSEAS_ENTITY_PRESENTER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
