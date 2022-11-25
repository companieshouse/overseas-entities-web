import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { VALID_CHARACTERS } from "./regex/regex.validation";

export const presenter = [
  body("full_name")
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_FULL_NAME_LENGTH)
    .matches(VALID_CHARACTERS).withMessage(ErrorMessages.FULL_NAME_INVALID_CHARACTERS),
  body("email").trim()
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
    .isEmail().withMessage(ErrorMessages.EMAIL_INVALID_FORMAT)
];
