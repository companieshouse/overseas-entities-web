import { check } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const presenter = [
  check("full_name").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.FULL_NAME),
  check("email").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.EMAIL)
];
