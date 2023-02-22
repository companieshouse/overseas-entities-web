import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../../utils/logger";
import * as config from "../../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.UPDATE_SIGN_OUT_URL}`);

    return res.render(config.UPDATE_SIGN_OUT_PAGE, {
      previousPage: `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`,
      url: config.UPDATE_AN_OVERSEAS_ENTITY_URL
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.UPDATE_SIGN_OUT_PAGE}`);
    const previousPage = req.body["previousPage"];

    if (!previousPage.startsWith(config.UPDATE_AN_OVERSEAS_ENTITY_URL)){
      throw createAndLogErrorRequest(req, `${previousPage} page is not part of the journey!`);
    }

    if (req.body["sign_out"] === 'yes') {
    // This url may change depending on decision made on ticket UAR-267
      return res.redirect(config.UPDATE_ACCOUNTS_SIGN_OUT_URL);
    }

    return res.redirect(previousPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
