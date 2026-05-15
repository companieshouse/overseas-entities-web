/**
 * Middleware to generate the sign-out baseUrl for each journey
 */
import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { isRegistrationJourney, getRedirectUrl } from "../../utils/url";

export const generateSignOutBaseUrl = (req: Request, res: Response, next: NextFunction) => {

  logger.info("Generating sign-out-base-url");
  let signOutBaseUrl: string;

  if (isRegistrationJourney(req)) {
    signOutBaseUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.REGISTER_AN_OVERSEAS_ENTITY_URL,
    });
  } else {
    signOutBaseUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
    });
  }
  res.locals.signOutBaseUrl = signOutBaseUrl;
  return next();
};
