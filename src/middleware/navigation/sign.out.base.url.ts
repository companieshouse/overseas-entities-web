/**
 * Middleware to generate the sign-out baseUrl for the respective journeys
 * Assumes "res.locals.journey" has been set from previous middleware executions
 */
import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import {
  isRegistrationJourney,
  getUrlWithParamsToPath,
  transactionIdAndSubmissionIdExistInRequest
} from "../../utils/url";

export const generateSignOutBaseUrl = (req: Request, res: Response, next: NextFunction) => {
  logger.info("setting sign-our-base-url");
  let signOutBaseUrl: string = config.UPDATE_AN_OVERSEAS_ENTITY_URL;
  if (isRegistrationJourney(req)) {
    if (!transactionIdAndSubmissionIdExistInRequest(req)) {
      signOutBaseUrl = config.REGISTER_AN_OVERSEAS_ENTITY_URL;
    } else {
      signOutBaseUrl = getUrlWithParamsToPath(config.REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL, req);
    }
  }
  res.locals.signOutBaseUrl = signOutBaseUrl;
  return next();
};
