import { body } from "express-validator";
import { RoleWithinTrustType } from "../../model/role.within.trust.type.model";
import {
  checkBirthDate,
  checkDate,
  checkDateFieldDay,
  checkDateFieldDayOfBirth,
  checkDateFieldMonth,
  checkDateFieldYear,
  checkDateOfBirth,
  checkIdentityDate,
  checkStartDate,
  checkTrustDate
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";
import { conditionalDateValidations, dateContext, dateContextWithCondition, dateValidations } from "./helper/date.validation.helper";

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const start_date_validations = [
  body("start_date-day")
    .custom((value, { req }) => checkDateFieldDay(req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, ErrorMessages.MONTH_AND_YEAR, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date")
    .custom((value, { req }) => checkStartDate(req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
];

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const date_of_birth_validations = [
  body("date_of_birth-day")
    .custom((value, { req }) => checkDateFieldDayOfBirth(req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH_OF_BIRTH, ErrorMessages.MONTH_AND_YEAR_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR_OF_BIRTH, ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth")
    .custom((value, { req }) => checkDateOfBirth(req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
];

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const identity_check_date_validations = [
  body("identity_date-day")
    .custom((value, { req }) => checkDateFieldDay(req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, ErrorMessages.MONTH_AND_YEAR, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
  body("identity_date")
    .custom((value, { req }) => checkIdentityDate(req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
];

const dateOfBirthValidationsContext: dateContext = {
  dateInput: {
    name: "dateOfBirth",
    callBack: checkBirthDate,
  },
  dayInputName: "dateOfBirthDay",
  monthInputName: "dateOfBirthMonth",
  yearInputName: "dateOfBirthYear",
};

const dateBecameIPContext: dateContextWithCondition = {
  dateInput: {
    name: "dateBecameIP",
    callBack: checkDate,
  },
  dayInputName: "dateBecameIPDay",
  monthInputName: "dateBecameIPMonth",
  yearInputName: "dateBecameIPYear",
  condition: { elementName: "type", expectedValue: RoleWithinTrustType.INTERESTED_PERSON }
};

const trustCreatedDateValidationsContext: dateContext = {
  dateInput: {
    name: "createdDate",
    callBack: checkTrustDate,
  },
  dayInputName: "createdDateDay",
  monthInputName: "createdDateMonth",
  yearInputName: "createdDateYear",
};

const historicalBOContext: dateContext = {
  dateInput: {
    name: "startDate",
    callBack: checkTrustDate,
  },
  dayInputName: "startDateDay",
  monthInputName: "startDateMonth",
  yearInputName: "startDateYear",
};

export const dateOfBirthValidations = dateValidations(dateOfBirthValidationsContext);

export const dateBecameIP = conditionalDateValidations(dateBecameIPContext);

export const trustCreatedDateValidations = dateValidations(trustCreatedDateValidationsContext);

export const historicalBeneficialOwnerStartDate = dateValidations(historicalBOContext);
