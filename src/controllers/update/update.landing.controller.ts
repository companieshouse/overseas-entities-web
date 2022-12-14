import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `Redirecting to ${config.UPDATE_LANDING_PAGE_URL}`);
    return res.redirect(config.UPDATE_LANDING_PAGE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
