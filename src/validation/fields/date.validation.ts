import { body } from "express-validator";
import { RoleWithinTrustType } from "../../model/role.within.trust.type.model";
import {
  checkDateFieldDay,
  checkDateFieldMonth,
  checkDateFieldYear,
  checkDateOfBirth,
  checkIdentityDate,
  checkStartDate
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { conditionalDateValidations, dateContext, dateContextWithCondition, dateValidations } from "./helper/date.validation.helper";

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const start_date_validations = [
  body("start_date-day")
    .custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date")
    .custom((value, { req }) => checkStartDate(req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
];

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const date_of_birth_validations = [
  body("date_of_birth-day")
    .if(body("date_of_birth-year").isLength({ min: 4, max: 4 }))
    .custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-month")
    .if(body("date_of_birth-year").isLength({ min: 4, max: 4 }))
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR_OF_BIRTH, ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth")
    .custom((value, { req }) => checkDateOfBirth(req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
];

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const identity_check_date_validations = [
  body("identity_date-day")
    .custom((value, { req }) => checkDateFieldDay(ErrorMessages.DAY, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date")
    .custom((value, { req }) => checkIdentityDate(req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
];

const dateOfBirthValidationsContext: dateContext = {
  dateInput: {
    name: "dateOfBirth",
    callBack: checkDateOfBirth,
    errMsg: [],
  },
  day: {
    name: "dateOfBirthDay",
    callBack: checkDateFieldDay,
    errMsg: [ErrorMessages.DAY_OF_BIRTH],
  },
  month: {
    name: "dateOfBirthMonth",
    callBack: checkDateFieldMonth,
    errMsg: [ErrorMessages.MONTH_OF_BIRTH],
  },
  year: {
    name: "dateOfBirthYear",
    callBack: checkDateFieldYear,
    errMsg: [ErrorMessages.YEAR_OF_BIRTH, ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH],
  }
};

const dateBecameIPContext: dateContextWithCondition = {
  dateInput: {
    name: "dateBecameIP",
    callBack: checkStartDate,
    errMsg: [],
  },
  day: {
    name: "dateBecameIPDay",
    callBack: checkDateFieldDay,
    errMsg: [ErrorMessages.DAY],
  },
  month: {
    name: "dateBecameIPMonth",
    callBack: checkDateFieldMonth,
    errMsg: [ErrorMessages.MONTH],
  },
  year: {
    name: "dateBecameIPYear",
    callBack: checkDateFieldYear,
    errMsg: [ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH],
  },
  condition: { elementName: "type", expectedValue: RoleWithinTrustType.INTERESTED_PERSON }
};

export const dateOfBirthValidations = dateValidations(dateOfBirthValidationsContext, 4, 4);

export const dateBecameIP = conditionalDateValidations(dateBecameIPContext, 4, 4);

