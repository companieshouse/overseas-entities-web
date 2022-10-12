import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);

    return res.render(config.SIGN_OUT_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SIGN_OUT_PAGE}`);

    logger.debugRequest(req, `${JSON.stringify(req.body)}`);
    if (req.body["sign_out"] === 'yes') {
      return res.redirect(config.ACCOUNTS_SIGNOUT_URL);
    }

    return res.redirect(req.body["previous_page"]);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
