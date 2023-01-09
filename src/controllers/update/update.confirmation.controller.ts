import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.UPDATE_CONFIRMATION_URL}`);
    return res.render(config.UPDATE_CONFIRMATION_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.UPDATE_CONFIRMATION_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
