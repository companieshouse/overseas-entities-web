import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { identity_address_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { identity_date_validations } from "./fields/date.validation";

export const dueDiligence = [

  ...identity_date_validations,

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DUE_DILIGENCE_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...identity_address_validations,

  body("email")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
    .isLength({ max: 250 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
    .isEmail().withMessage(ErrorMessages.EMAIL_INVALID_FORMAT),

  body("supervisory_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.SUPERVISORY_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("agent_code").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.AGENT_CODE),

  body("partner_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PARTNER_NAME)
    .isLength({ max: 160 }).withMessage(ErrorMessages.MAX_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("diligence").not().isEmpty().withMessage(ErrorMessages.CHECK_DILIGENCE)
];
