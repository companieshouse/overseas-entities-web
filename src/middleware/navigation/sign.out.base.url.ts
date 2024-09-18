/**
 * Middleware to generate the sign-out baseUrl for the respective journeys
 * Assumes "res.locals.journey" has been set from previous middleware executions
 */
import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import {
  getUrlWithParamsToPath,
  transactionIdAndSubmissionIdExistInRequest
} from "../../utils/url";

export const generateSignOutBaseUrl = (req: Request, res: Response, next: NextFunction) => {
  switch (res.locals.journey) {
      case "register":
        if (!transactionIdAndSubmissionIdExistInRequest(req)) {
          res.locals.signOutBaseUrl = config.REGISTER_AN_OVERSEAS_ENTITY_URL;
        } else {
          res.locals.signOutBaseUrl = getUrlWithParamsToPath(config.REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL, req);
        }
        break;
      case "update":
        res.locals.signOutBaseUrl = config.UPDATE_AN_OVERSEAS_ENTITY_URL;
        break;
      case "remove":
        res.locals.signOutBaseUrl = config.UPDATE_AN_OVERSEAS_ENTITY_URL;
        break;
      default:
        logger.info("res.locals.journey not set");
        throw Error("res.locals.journey should be set at this point");
  }
  return next();
};
