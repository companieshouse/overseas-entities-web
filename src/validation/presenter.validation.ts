import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";
import { INVALID_CHARACTERS } from "./regex/regex.validation";

export const presenter = [
  body("full_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME).isLength({ max: 160 }).withMessage(ErrorMessages.MAX_FULL_NAME_LENGTH).matches(INVALID_CHARACTERS).withMessage(ErrorMessages.INVALID_CHARACTERS_FULL_NAME),
  body("email").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL).isLength({ max: 250 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
];
