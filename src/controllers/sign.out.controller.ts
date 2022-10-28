import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);
    return res.render(config.SIGN_OUT_PAGE, {
      previousPage: `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SIGN_OUT_PAGE}`);
    let previousPage = req.body["previous_page"];
    if (!previousPage) {
      previousPage = `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`;
    }
    if (!previousPage.startsWith(config.REGISTER_AN_OVERSEAS_ENTITY_URL)){
      throw createAndLogErrorRequest(req, `${previousPage} page is not part of the journey!`);
    }

    if (req.body["sign_out"] === 'yes') {
      return res.redirect(config.ACCOUNTS_SIGN_OUT_URL);
    }

    return res.redirect(previousPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
