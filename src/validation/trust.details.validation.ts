import { body } from "express-validator";
import { ErrorMessages } from "./error.messages";
import { trustCreatedDateValidations, trustCeasedDateValidations } from "./fields/date.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";

export const trustDetails = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_NAME_2)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS_TRUST)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_TRUST),

  ...trustCreatedDateValidations,

  body("beneficialOwnersIds")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INVOLVED_BOS),

  body("hasAllInfo")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_HAS_ALL_INFO)
];

export const reviewTrustDetails = [
  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.TRUST_NAME_2)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS_TRUST)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_TRUST),

  body("beneficialOwnersIds")
    .if(body("isTrustToBeCeased").not().equals("true"))
    .not().isEmpty().withMessage(ErrorMessages.TRUST_INVOLVED_BOS),

  // trustCeasedDateValidations are conditional and will run if "isTrustToBeCeased" == "true"
  ...trustCeasedDateValidations,

  body("hasAllInfo")
    .not().isEmpty().withMessage(ErrorMessages.TRUST_HAS_ALL_INFO)
];
