import { body } from "express-validator";

import { checkDate } from "../custom.validation";
import { ErrorMessages } from "../error.messages";

export const start_date_validations = [
  body("start_date").custom((value, { req }) => checkDate(ErrorMessages.MANAGING_OFFICER_START_DATE, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"]) ),
  body("start_date-day").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DAY),
  body("start_date-month").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MONTH),
  body("start_date-year").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.YEAR)
];
