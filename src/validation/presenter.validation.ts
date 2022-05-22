import { body } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const presenter = [
  body("full_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME),
  body("email").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
];
