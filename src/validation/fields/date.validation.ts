import { body } from "express-validator";

import { checkDate, checkDateIsInPast, checkDateValueIsValid } from "../custom.validation";
import { ErrorMessages } from "../error.messages";

export const start_date_validations = [
  body("start_date")
    .custom((value, { req }) => checkDate(ErrorMessages.ENTER_START_DATE, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"]))
    .custom((value, { req }) =>  checkDateValueIsValid(ErrorMessages.INVALID_START_DATE, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"]))
    .custom((value, { req }) => checkDateIsInPast(ErrorMessages.START_DATE_NOT_IN_PAST, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-day").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DAY),
  body("start_date-month").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MONTH),
  body("start_date-year").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.YEAR)
];

export const date_of_birth_validations = [
  body("date_of_birth")
    .custom((value, { req }) => checkDate(ErrorMessages.ENTER_DATE_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"]))
    .custom((value, { req }) => checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-day").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.DAY_OF_BIRTH),
  body("date_of_birth-month").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.MONTH_OF_BIRTH),
  body("date_of_birth-year").not().isEmpty({ ignore_whitespace: true }).withMessage(ErrorMessages.YEAR_OF_BIRTH),
];
