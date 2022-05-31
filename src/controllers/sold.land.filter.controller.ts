import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SOLD_LAND_FILTER_PAGE}`);

    return res.render(config.SOLD_LAND_FILTER_PAGE, {
      backLinkUrl: config.LANDING_URL,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SOLD_LAND_FILTER_PAGE}`);
    const hasSoldLand = req.body.has_sold_land;
    if (hasSoldLand === '1') {
      return res.render(config.CANNOT_USE_PAGE, {
        backLinkUrl: config.SOLD_LAND_FILTER_URL
      });
    } else if (hasSoldLand === '0') {
      return res.redirect(config.SECURE_REGISTER_FILTER_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
