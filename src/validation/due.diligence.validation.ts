import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { identity_address_validations } from "./fields/address.validation";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { identity_check_date_validations } from "./fields/date.validation";
import { email_validations } from "./fields/email.validation";

export const dueDiligence = [

  ...identity_check_date_validations,

  body("name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DUE_DILIGENCE_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_AGENT_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  ...identity_address_validations,
  ...email_validations,

  body("aml_number")
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_AML_NUMBER_LENGTH),

  body("supervisory_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.SUPERVISORY_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_SUPERVISORY_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("agent_code")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.AGENT_CODE)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_AGENT_ASSURANCE_CODE_LENGTH),

  body("partner_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.PARTNER_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_PARTNER_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.NAME_INVALID_CHARACTERS),

  body("diligence").not().isEmpty().withMessage(ErrorMessages.CHECK_DILIGENCE)
];
