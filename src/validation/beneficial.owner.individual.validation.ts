import { check } from "express-validator";

import { ErrorMessages } from "./error.messages";

export const boIndividualValidator = [
  check("first_name").not().isEmpty({ ignore_whitespace: true }).withMessage(`${ErrorMessages.MANDANDORY_FIELD}`)
];
