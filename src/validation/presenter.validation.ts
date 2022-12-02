import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";
import { email_validations } from "./fields/email.validation";

export const presenter = [
  body("full_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_FULL_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FULL_NAME_INVALID_CHARACTERS),
  ...email_validations
];
