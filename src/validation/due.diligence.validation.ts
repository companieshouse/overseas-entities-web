import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const dueDiligence = [
  body("email").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL).isLength({ max: 250 }).withMessage(ErrorMessages.MAX_EMAIL_LENGTH).isEmail().withMessage(ErrorMessages.EMAIL_INVALID_FORMAT)
];
