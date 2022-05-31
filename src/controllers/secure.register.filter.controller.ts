import { Request, Response, NextFunction } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SECURE_REGISTER_FILTER_PAGE}`);
    return res.render(config.SECURE_REGISTER_FILTER_PAGE, {
      backLinkUrl: config.SOLD_LAND_FILTER_URL
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, `POST ${config.SECURE_REGISTER_FILTER_PAGE}`);
  try {
    if (req.body.secure_register === '1') {
      return res.render(config.USE_PAPER_PAGE, {
        backLinkUrl: config.SECURE_REGISTER_FILTER_URL
      });
    } else if (req.body.secure_register === '0') {
      return res.redirect(config.INTERRUPT_CARD_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
