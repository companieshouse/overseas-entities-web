import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { logger } from "../utils/logger";
import { ErrorMessages } from "./error.messages";
import { trustCreatedDateValidations, trustCeasedDateValidations } from "./fields/date.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { ApplicationData } from "../model";
import { fetchApplicationData } from "../utils/application.data";
import { hasNoBoAssignableToTrust } from "../utils/trusts";
import { isRegistrationJourney } from "../utils/url";

const setIsTrustToBeCeasedFlagOnBody = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (req.body["stillInvolved"] === "1") {
        return next();
      }
      const isRegistration = isRegistrationJourney(req);
      const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
      const isTrustToBeCeased = req.body["stillInvolved"] === "0" || hasNoBoAssignableToTrust(appData) ? "true" : "false";
      // Create a new object with the updated property
      req.body = { ...req.body, isTrustToBeCeased };
      return next();
    } catch (error) {
      logger.errorRequest(req, error);
      return next(error);
    }
  };
};

export const trustDetails = [
  // Need to set this flag so it can be checked in the other validators
  setIsTrustToBeCeasedFlagOnBody(),

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_NAME_2)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS_TRUST)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_TRUST),

  ...trustCreatedDateValidations,

  body("beneficialOwnersIds")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INVOLVED_BOS),

  // trustCeasedDateValidations are conditional and will only run if the trust is being ceased
  ...trustCeasedDateValidations,

  body("hasAllInfo")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_HAS_ALL_INFO)
];

export const reviewTrustDetails = [
  // Need to set this flag so it can be checked in the other validators
  setIsTrustToBeCeasedFlagOnBody(),

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_NAME_2)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS_TRUST)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_TRUST),

  body("beneficialOwnersIds")
    .if(body("isTrustToBeCeased").not().equals("true"))
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INVOLVED_BOS),

  // trustCeasedDateValidations are conditional and will only run if the trust is being ceased
  ...trustCeasedDateValidations,

  body("hasAllInfo")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_HAS_ALL_INFO)
];
