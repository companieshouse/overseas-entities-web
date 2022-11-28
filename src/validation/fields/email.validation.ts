import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";
import { VALID_EMAIL_FORMAT } from "../regex/regex.validation";

export const email_validations = [
  body('email')
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
    .matches(VALID_EMAIL_FORMAT).withMessage(ErrorMessages.EMAIL_INVALID_FORMAT)
];
