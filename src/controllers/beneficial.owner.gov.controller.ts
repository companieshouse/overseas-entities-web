import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.BENEFICIAL_OWNER_GOV_PAGE}`);

    return res.render(config.BENEFICIAL_OWNER_GOV_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ${config.BENEFICIAL_OWNER_GOV_PAGE}`);

    return res.redirect(config.MANAGING_OFFICER_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
