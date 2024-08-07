import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";
import { safeRedirect } from '../utils/http.ext';
import { getPreviousPageUrl } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);

    const previousPageUrl = getPreviousPageUrl(req, config.REGISTER_AN_OVERSEAS_ENTITY_URL);

    return res.render(config.SIGN_OUT_PAGE, {
      previousPage: previousPageUrl,
      journey: config.JourneyType.register
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SIGN_OUT_PAGE}`);
    const previousPage = req.body["previousPage"];

    if (!previousPage.startsWith(config.REGISTER_AN_OVERSEAS_ENTITY_URL)){
      throw createAndLogErrorRequest(req, `${previousPage} page is not part of the journey!`);
    }

    if (req.body["sign_out"] === 'yes') {
      return res.redirect(config.ACCOUNTS_SIGN_OUT_URL);
    }

    return safeRedirect(res, previousPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
