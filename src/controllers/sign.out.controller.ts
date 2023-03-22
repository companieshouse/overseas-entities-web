import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);

    // Get the trust link for the previous page from the raw header
    const headers = req.rawHeaders;
    console.log(`register headers filter is ${headers.filter(item => item.includes(config.REGISTER_AN_OVERSEAS_ENTITY_URL))}`);
    console.log(`update filter is ${headers.filter(item => item.includes(config.UPDATE_AN_OVERSEAS_ENTITY_URL))}`);

    const previousPageUrl = headers.filter(item => item.includes(config.REGISTER_AN_OVERSEAS_ENTITY_URL) || item.includes(config.UPDATE_AN_OVERSEAS_ENTITY_URL));
    console.log(`previous page ${previousPageUrl}`);
    return res.render(config.SIGN_OUT_PAGE, {
      previousPage: previousPageUrl[0],
      url: config.REGISTER_AN_OVERSEAS_ENTITY_URL,
      saveAndResume: isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022),
      journey: "register"
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SIGN_OUT_PAGE}`);
    console.log(`request body is ${JSON.stringify(req.body)}`);
    const previousPage = req.body["previousPage"];
    console.log(`previous page is ${previousPage}`);
    console.log(`does previous page include ${previousPage.includes(config.UPDATE_AN_OVERSEAS_ENTITY_URL)}`);
    if (!previousPage.includes(config.REGISTER_AN_OVERSEAS_ENTITY_URL) && !previousPage.includes(config.UPDATE_AN_OVERSEAS_ENTITY_URL)){
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
