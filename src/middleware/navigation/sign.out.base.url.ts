/**
 * Middleware to generate the sign-out baseUrl for each journey
 */
import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";

import {
  isRegistrationJourney,
  getTransactionIdAndSubmissionIdFromOriginalUrl,
  getUrlWithTransactionIdAndSubmissionId
} from "../../utils/url";

export const generateSignOutBaseUrl = (req: Request, res: Response, next: NextFunction) => {

  logger.info("Generating sign-out-base-url");
  let signOutBaseUrl: string = config.UPDATE_AN_OVERSEAS_ENTITY_URL;

  if (isRegistrationJourney(req)) {
    const transactionIdAndSubmissionId = getTransactionIdAndSubmissionIdFromOriginalUrl(req);
    if (!transactionIdAndSubmissionId) {
      signOutBaseUrl = config.REGISTER_AN_OVERSEAS_ENTITY_URL;
    } else {
      signOutBaseUrl = getUrlWithTransactionIdAndSubmissionId(
        config.REGISTER_AN_OVERSEAS_ENTITY_WITH_PARAMS_URL,
        transactionIdAndSubmissionId.transactionId,
        transactionIdAndSubmissionId.submissionId
      );
    }
  }
  res.locals.signOutBaseUrl = signOutBaseUrl;
  return next();
};
