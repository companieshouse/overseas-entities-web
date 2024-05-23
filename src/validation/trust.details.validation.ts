import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";
import { trustCreatedDateValidations, trustCeasedDateValidations } from "./fields/date.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";
import { isActiveFeature } from "../utils/feature.flag";
import * as config from "../config";
import { logger } from "../utils/logger";
import { hasNoBoAssignableToTrust } from "../utils/trusts";

const setIsTrustToBeCeasedFlagOnBody = () => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const isTrustStillInvolved = req.body["stillInvolved"] === "1";

      if (isTrustStillInvolved) {
        return next();
      }

      if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_CEASE_TRUSTS)) {
        return next();
      }

      const appData: ApplicationData = getApplicationData(req.session);

      const isTrustToBeCeased = !isTrustStillInvolved || hasNoBoAssignableToTrust(appData) ? "true" : "false";
      // Create a new object with the updated property
      req.body = { ...req.body, isTrustToBeCeased };

      return next();
    } catch (error) {
      logger.errorRequest(req, error);
      return next(error);
    }
  };
};

export const checkTrustStillInvolved = (
  req: Request
): boolean => {
  const appData: ApplicationData = getApplicationData(req.session);

  return !hasNoBoAssignableToTrust(appData);
};

export const trustDetails = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_NAME_2)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS_TRUST)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_TRUST),

  ...trustCreatedDateValidations,

  body("stillInvolved")
    .if((value, { req }) => checkTrustStillInvolved(req))
    .not().isEmpty().withMessage(ErrorMessages.TRUST_STILL_INVOLVED),

  body("beneficialOwnersIds")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INVOLVED_BOS),

  body("hasAllInfo")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_HAS_ALL_INFO)
];

export const reviewTrustDetails = [
  // need to set this flag so it can be checked in the other validators
  setIsTrustToBeCeasedFlagOnBody(),

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_NAME_2)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS_TRUST)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_TRUST),

  body("stillInvolved")
    .if((value, { req }) => checkTrustStillInvolved(req))
    .not().isEmpty().withMessage(ErrorMessages.TRUST_STILL_INVOLVED),

  body("beneficialOwnersIds")
    .if(body("isTrustToBeCeased").not().equals("true"))
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INVOLVED_BOS),

  // trustCeasedDateValidations are conditional and will only run if the trust is being ceased
  ...trustCeasedDateValidations,

  body("hasAllInfo")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_HAS_ALL_INFO)
];
