import { body } from "express-validator";
import {
  checkDateFieldDay,
  checkDateFieldMonth,
  checkDateFieldYear,
  checkDateOfBirth,
  checkDateYearValueIsFourNumbers,
  checkIdentityDate,
  checkStartDate
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";

export const start_date_validations = [
  body("start_date-day").custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-month").custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-year").custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-year").custom((value, { req }) => checkDateYearValueIsFourNumbers(ErrorMessages.YEAR_LENGTH, req.body["start_date-year"])),
  body("start_date")
    .custom((value, { req }) => checkStartDate(req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
];

export const date_of_birth_validations = [
  body("date_of_birth-day")
    .custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-year")
    .custom((value, { req }) => checkDateYearValueIsFourNumbers(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH, req.body["date_of_birth-year"])),
  body("date_of_birth")
    .custom((value, { req }) => checkDateOfBirth(req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
];

export const identity_check_date_validations = [
  body("identity_date-day")
    .custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-year")
    .custom((value, { req }) => checkDateYearValueIsFourNumbers(ErrorMessages.YEAR_LENGTH, req.body["identity_date-year"])),
  body("identity_date")
    .custom((value, { req }) => checkIdentityDate(req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
];
