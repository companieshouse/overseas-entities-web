import { body } from "express-validator";
import { ErrorMessages } from "../error.messages";
import { VALID_EMAIL_FORMAT } from "../regex/regex.validation";

export const email_validations = [
  body("email").trim()
    .not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
    .isLength({ max: 256 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
    .matches(VALID_EMAIL_FORMAT).withMessage(ErrorMessages.EMAIL_INVALID_FORMAT)
];

export const contact_email_validations = [
  body("contact_email").trim()
    .not().isEmpty().withMessage(ErrorMessages.EMAIL)
    .isLength({ max: 250 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH)
    .matches(VALID_EMAIL_FORMAT).withMessage(ErrorMessages.EMAIL_INVALID_FORMAT)
];
