import { body } from "express-validator";
import { TrusteeType } from "../model/trustee.type.model";
import { ErrorMessages } from "./error.messages";
import { historicalBeneficialOwnerEndDate, historicalBeneficialOwnerStartDate } from "./fields/date.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";

export const trustHistoricalBeneficialOwner = [
  body("type")
    .notEmpty().withMessage(ErrorMessages.HISTORICAL_BENEFICIAL_OWNER_ROLE).if(body("type")),
  body("corporate_name")
    .if(body("type").equals(TrusteeType.LEGAL_ENTITY))
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.HISTORICAL_BO_CORPORATE_NAME)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_HISTORICAL_BO_CORPORATE_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.HISTORICAL_BO_CORPORATE_NAME_INVALID_CHARACTERS),
  body("firstName")
    .if(body("type").equals(TrusteeType.INDIVIDUAL))
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.HISTORICAL_BO_FIRST_NAME)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_HISTORICAL_BO_FIRST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.HISTORICAL_BO_FIRST_NAME_INVALID_CHARACTERS),
  body("lastName")
    .if(body("type").equals(TrusteeType.INDIVIDUAL))
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.HISTORICAL_BO_LAST_NAME)
    .isLength({ max: 50 }).withMessage(ErrorMessages.MAX_HISTORICAL_BO_LAST_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.HISTORICAL_BO_LAST_NAME_INVALID_CHARACTERS),
  ...historicalBeneficialOwnerStartDate,
  ...historicalBeneficialOwnerEndDate,
];
