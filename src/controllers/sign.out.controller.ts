import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);
    let hint = "Your answers will not be saved. You will need to start again if you want to register an overseas entity and tell us about its beneficial owners.";
    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      hint = "We will save your application.";
    }
    return res.render(config.SIGN_OUT_PAGE, {
      previousPage: `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`,
      hintText: hint
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

    return res.redirect(previousPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
