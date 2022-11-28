import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const landingUrl = config.UPDATE_LANDING_PAGE_URL;
    logger.debugRequest(req, `GET UPDATE LANDING_PAGE`);
    logger.debugRequest(req, `Redirecting to ${landingUrl}`);
    return res.redirect(landingUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
