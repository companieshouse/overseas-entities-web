import { NextFunction, Request, Response } from "express";

import { createAndLogErrorRequest, logger } from "../utils/logger";
import * as config from "../config";
import { isActiveFeature } from "../utils/feature.flag";
import { safeRedirect } from '../utils/http.ext';
import { JourneyType } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);

    const previousPageUrl = getPreviousPageUrl(req);

    return res.render(config.SIGN_OUT_PAGE, {
      previousPage: previousPageUrl,
      saveAndResume: isActiveFeature(config.FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022),
      journey: JourneyType.register
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

function getPreviousPageUrl(req: Request) {
  const headers = req.rawHeaders;
  const absolutePreviousPageUrl = headers.filter(item => item.includes(config.REGISTER_AN_OVERSEAS_ENTITY_URL))[0];

  // Don't attempt to determine a relative previous page URL if no absolute URL is found
  if (!absolutePreviousPageUrl) {
    return absolutePreviousPageUrl;
  }

  const startingIndexOfRelativePath = absolutePreviousPageUrl.indexOf(config.REGISTER_AN_OVERSEAS_ENTITY_URL);
  const relativePreviousPageUrl = absolutePreviousPageUrl.substring(startingIndexOfRelativePath);

  logger.debugRequest(req, `Relative previous page URL is ${relativePreviousPageUrl}`);

  return relativePreviousPageUrl;
}
