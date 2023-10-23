import { body } from "express-validator";
import { RoleWithinTrustType } from "../../model/role.within.trust.type.model";
import {
  checkBirthDate,
  checkDateIPIndividualBO,
  checkDateFieldDay,
  checkDateFieldDayOfBirth,
  checkDateFieldMonth,
  checkDateFieldYear,
  checkDateOfBirth,
  checkHistoricalBOEndDate,
  checkHistoricalBOStartDate,
  checkIdentityDate,
  checkDate,
  checkTrustDate,
  DayFieldErrors,
  MonthFieldErrors,
  YearFieldErrors,
  checkDateIPLegalEntityBO,
  checkCeasedDateOnOrAfterStartDate,
  checkStartDateBeforeDOB
  checkFirstDateOnOrAfterSecondDate,
  checkFilingPeriod
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
  body("start_date-day")
    .custom((value, { req }) => checkDate(req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"])),
  body("start_date-day")
    .custom((value, { req }) => checkStartDateBeforeDOB(
      req.body["start_date-day"],
      req.body["start_date-month"],
      req.body["start_date-year"],
      req.body["date_of_birth-day"],
      req.body["date_of_birth-month"],
      req.body["date_of_birth-year"]
    )),
];

const is_still_active_validations = (date_field_id: string, radio_button_id: string, error_message: string) => [
  body(date_field_id + "-day")
    .if(body(radio_button_id).equals('0'))
    .custom((value, { req }) => checkDateFieldDay(req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"])),
  body(date_field_id + "-month")
    .if(body(radio_button_id).equals('0'))
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, ErrorMessages.MONTH_AND_YEAR, req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"])),
  body(date_field_id + "-year")
    .if(body(radio_button_id).equals('0'))
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"])),
  body(date_field_id)
    .if(body(radio_button_id).equals('0'))
    .custom((value, { req }) => checkDate(req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"]))
    .custom((value, { req }) => checkCeasedDateOnOrAfterStartDate(
      req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"],
      req.body["start_date-day"], req.body["start_date-month"], req.body["start_date-year"],
      error_message
    )),
];

const is_trust_still_active_validation = (error_message: string) => [
  body("endDate")
    .custom((value, { req }) => checkFirstDateOnOrAfterSecondDate(
      req.body["endDateDay"], req.body["endDateMonth"], req.body["endDateYear"],
      req.body["startDateDay"], req.body["startDateMonth"], req.body["startDateYear"],
      error_message
    )),
];

const is_date_within_filing_period = (date_field_id: string, error_message: string) => [
  body(date_field_id)
    .custom((value, { req }) => checkFilingPeriod(
      req,
      req.body[date_field_id + "-day"], req.body[date_field_id + "-month"], req.body[date_field_id + "-year"],
      error_message
    )),
];

export const ceased_date_validations = is_still_active_validations("ceased_date", "is_still_bo", ErrorMessages.CEASED_DATE_BEFORE_START_DATE);

export const resigned_on_validations = is_still_active_validations("resigned_on", "is_still_mo", ErrorMessages.RESIGNED_ON_BEFORE_START_DATE);

export const trustFormerBODateValidations = is_trust_still_active_validation(ErrorMessages.TRUST_CEASED_DATE_BEFORE_START_DATE);

export const filingPeriodStartDateValidations = is_date_within_filing_period("start_date", ErrorMessages.START_DATE_BEFORE_FILING_DATE);

// to prevent more than 1 error reported on the date fields we check if the year is valid before doing some checks.
// This means that the year check is checked before some others
export const date_of_birth_validations = [
  body("date_of_birth-day")
    .custom((value, { req }) => checkDateFieldDayOfBirth(req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH_OF_BIRTH, ErrorMessages.MONTH_AND_YEAR_OF_BIRTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR_OF_BIRTH, ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH, req.body["date_of_birth-day"], req.body["date_of_birth-month"], req.body["date_of_birth-year"])),
  body("date_of_birth-day")
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
  body("identity_date-day")
    .custom((value, { req }) => checkIdentityDate(req.body["identity_date-day"], req.body["identity_date-month"], req.body["identity_date-year"])),
];

export const filing_date_validations = [
  body("filing_date-day")
    .custom((value, { req }) => checkDateFieldDay(req.body["filing_date-day"], req.body["filing_date-month"], req.body["filing_date-year"])),
  body("filing_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, ErrorMessages.MONTH_AND_YEAR, req.body["filing_date-day"], req.body["filing_date-month"], req.body["filing_date-year"])),
  body("filing_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH, req.body["filing_date-day"], req.body["filing_date-month"], req.body["filing_date-year"])),
  body("filing_date-day")
    .custom((value, { req }) => checkDate(req.body["filing_date-day"], req.body["filing_date-month"], req.body["filing_date-year"])),
];

const dateOfBirthValidationsContext: dateContext = {
  dayInput: {
    name: "dateOfBirthDay",
    errors: {
      noDayError: ErrorMessages.DAY_OF_BIRTH,
      wrongDayLength: ErrorMessages.DATE_OF_BIRTH_DAY_LENGTH,
      noRealDay: ErrorMessages.INVALID_DAY,
    } as DayFieldErrors,
  },
  monthInput: {
    name: "dateOfBirthMonth",
    errors: {
      noMonthError: ErrorMessages.MONTH_OF_BIRTH,
      wrongMonthLength: ErrorMessages.DATE_OF_BIRTH_MONTH_LENGTH,
      noRealMonth: ErrorMessages.INVALID_MONTH,
    } as MonthFieldErrors,
  },
  yearInput: {
    name: "dateOfBirthYear",
    errors: {
      noYearError: ErrorMessages.YEAR_OF_BIRTH,
      wrongYearLength: ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH
    } as YearFieldErrors,
  },
  dateInput: {
    name: "dateOfBirth",
    callBack: checkBirthDate,
  },
};

const defaultIPBOContext = (dayField, monthField, yearField, dateField, callBack) => ({
  dayInput: {
    name: dayField,
    errors: {
      noDayError: ErrorMessages.DAY,
      wrongDayLength: ErrorMessages.DAY_LENGTH,
      noRealDay: ErrorMessages.INVALID_DAY,
    } as DayFieldErrors,
  },
  monthInput: {
    name: monthField,
    errors: {
      noMonthError: ErrorMessages.MONTH,
      wrongMonthLength: ErrorMessages.MONTH_LENGTH,
      noRealMonth: ErrorMessages.INVALID_MONTH,
    } as MonthFieldErrors,
  },
  yearInput: {
    name: yearField,
    errors: {
      noYearError: ErrorMessages.YEAR,
      wrongYearLength: ErrorMessages.YEAR_LENGTH
    } as YearFieldErrors,
  },
  dateInput: {
    name: dateField,
    callBack,
  },
  condition: { elementName: "roleWithinTrust", expectedValue: RoleWithinTrustType.INTERESTED_PERSON },
}) as dateContextWithCondition;

const dateBecameIPIndividualBeneficialOwnerContext: dateContextWithCondition = defaultIPBOContext("dateBecameIPDay", "dateBecameIPMonth", "dateBecameIPYear", "dateBecameIP", checkDateIPIndividualBO);

const dateBecameIPLegalEntityBeneficialOwnerContext: dateContextWithCondition = defaultIPBOContext("interestedPersonStartDateDay", "interestedPersonStartDateMonth", "interestedPersonStartDateYear", "interestedPersonStartDate", checkDateIPLegalEntityBO);

const trustCreatedDateValidationsContext: dateContext = {
  dayInput: {
    name: "createdDateDay",
    errors: {
      noDayError: ErrorMessages.DAY_OF_TRUST,
      wrongDayLength: ErrorMessages.DAY_LENGTH_OF_TRUST,
      noRealDay: ErrorMessages.INVALID_DAY,
    } as DayFieldErrors,
  },
  monthInput: {
    name: "createdDateMonth",
    errors: {
      noMonthError: ErrorMessages.MONTH_OF_TRUST,
      wrongMonthLength: ErrorMessages.MONTH_LENGTH_OF_TRUST,
      noRealMonth: ErrorMessages.INVALID_MONTH,
    } as MonthFieldErrors,
  },
  yearInput: {
    name: "createdDateYear",
    errors: {
      noYearError: ErrorMessages.YEAR_OF_TRUST,
      wrongYearLength: ErrorMessages.YEAR_LENGTH_OF_TRUST
    } as YearFieldErrors,
  },
  dateInput: {
    name: "createdDate",
    callBack: checkTrustDate,
  },
};

const historicalBOStartDateContext: dateContext = {
  dayInput: {
    name: "startDateDay",
    errors: {
      noDayError: ErrorMessages.START_DAY_HISTORICAL_BO,
      wrongDayLength: ErrorMessages.START_DAY_LENGTH_HISTORICAL_BO,
      noRealDay: ErrorMessages.INVALID_DAY,
    } as DayFieldErrors,
  },
  monthInput: {
    name: "startDateMonth",
    errors: {
      noMonthError: ErrorMessages.START_MONTH_HISTORICAL_BO,
      wrongMonthLength: ErrorMessages.START_MONTH_LENGTH_HISTORICAL_BO,
      noRealMonth: ErrorMessages.INVALID_MONTH,
    } as MonthFieldErrors,
  },
  yearInput: {
    name: "startDateYear",
    errors: {
      noYearError: ErrorMessages.START_YEAR_HISTORICAL_BO,
      wrongYearLength: ErrorMessages.START_YEAR_LENGTH_HISTORICAL_BO
    } as YearFieldErrors,
  },
  dateInput: {
    name: "startDate",
    callBack: checkHistoricalBOStartDate,
  },
};

const historicalBOEndDateContext: dateContext = {
  dayInput: {
    name: "endDateDay",
    errors: {
      noDayError: ErrorMessages.END_DAY_HISTORICAL_BO,
      wrongDayLength: ErrorMessages.END_DAY_LENGTH_HISTORICAL_BO,
      noRealDay: ErrorMessages.INVALID_DAY,
    } as DayFieldErrors,
  },
  monthInput: {
    name: "endDateMonth",
    errors: {
      noMonthError: ErrorMessages.END_MONTH_HISTORICAL_BO,
      wrongMonthLength: ErrorMessages.END_MONTH_LENGTH_HISTORICAL_BO,
      noRealMonth: ErrorMessages.INVALID_MONTH,
    } as MonthFieldErrors,
  },
  yearInput: {
    name: "endDateYear",
    errors: {
      noYearError: ErrorMessages.END_YEAR_HISTORICAL_BO,
      wrongYearLength: ErrorMessages.END_YEAR_LENGTH_HISTORICAL_BO
    } as YearFieldErrors,
  },
  dateInput: {
    name: "endDate",
    callBack: checkHistoricalBOEndDate,
  },
};

export const dateOfBirthValidations = dateValidations(dateOfBirthValidationsContext);

export const dateBecameIPIndividualBeneficialOwner = conditionalDateValidations(dateBecameIPIndividualBeneficialOwnerContext);

export const trustCreatedDateValidations = dateValidations(trustCreatedDateValidationsContext);

export const historicalBeneficialOwnerStartDate = dateValidations(historicalBOStartDateContext);

export const historicalBeneficialOwnerEndDate = dateValidations(historicalBOEndDateContext);

export const dateBecameIPLegalEntityBeneficialOwner = conditionalDateValidations(dateBecameIPLegalEntityBeneficialOwnerContext);

