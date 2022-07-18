import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { identity_address_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { identity_check_date_validations } from "./fields/date.validation";

export const overseasEntityDueDiligence = [

  ...identity_check_date_validations,

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.OE_DUE_DILIGENCE_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_NAME_LENGTH_DUE_DILIGENCE)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...identity_address_validations,

  body("email")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH_DUE_DILIGENCE)
    .isEmail().withMessage(ErrorMessages.EMAIL_INVALID_FORMAT),

  body("aml_number")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_AML_NUMBER_LENGTH),

  body("supervisory_name")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_SUPERVISORY_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("partner_name")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_PARTNER_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),
];
