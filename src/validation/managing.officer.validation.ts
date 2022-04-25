import { check } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const moIndividualValidator = [
  check("fullName").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`)
];
