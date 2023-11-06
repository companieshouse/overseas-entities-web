// Custom validation utils - For now checking is not empty

import { VALID_CHARACTERS, VALID_EMAIL_FORMAT } from "./regex/regex.validation";
import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";
import { ApplicationData, trustType } from "../model";
import { BeneficialOwnersStatementType } from "../model/beneficial.owner.statement.model";
import { CONCATENATED_VALUES_SEPARATOR } from "../config";
import { getApplicationData } from "../utils/application.data";
import { FilingDateKey } from '../model/date.model';
import { DefaultErrorsSecondNationality } from "./models/second.nationality.error.model";

export const checkFieldIfRadioButtonSelected = (selected: boolean, errMsg: string, value: string = "") => {
  if ( selected && !value.trim() ) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkMaxFieldIfRadioButtonSelected = (selected: boolean, errMsg: string, maxValue: number, value: string = "") => {
  if ( selected && value.length > maxValue) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkInvalidCharactersIfRadioButtonSelected = (selected: boolean, errMsg: string, value: string) => {
  if (selected && !value.match(VALID_CHARACTERS)) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsNotCompletelyEmpty = (day: string = "", month: string = "", year: string = "") => {
  if ( !day.trim() && !month.trim() && !year.trim() ) {
    return false;
  }
  return true;
};

export const checkDateIsInPast = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const currentDate = DateTime.utc(now.year, now.month, now.day); // exclude time of day
  if (inputDate >= currentDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsInPastOrToday = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const currentDate = DateTime.utc(now.year, now.month, now.day); // exclude time of day
  if (inputDate > currentDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsWithinLast3Months = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const threeMonthOldDate = DateTime.utc(now.year, now.month, now.day).minus({ months: 3 });
  if (inputDate <= threeMonthOldDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateValueIsValid = (invalidDateErrMsg: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if (isNaN(day) || isNaN(month) || isNaN(year) || !DateTime.utc(year, month, day).isValid) {
    throw new Error(invalidDateErrMsg);
  }
  return true;
};

export const isYearEitherMissingOrCorrectLength = (yearStr: string = ""): boolean => {
  return (yearStr.length === 0 || yearStr.length === 4);
};

export const checkOptionalDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  // to prevent more than 1 error reported on the date fields we first check for multiple empty fields and then check if the year is correct length or missing before doing the date check as a whole.
  if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr) && isYearEitherMissingOrCorrectLength(yearStr)) {
    if ((dayStr !== "" || monthStr !== "" || yearStr !== "") && isYearEitherMissingOrCorrectLength(yearStr)) {
      checkOptionalDateDetails(dayStr, monthStr, yearStr);
    }
  }
  return true;
};

export const checkOptionalDateDetails = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const areDateFieldsPresent = checkAllDateFieldsArePresent(dayStr, monthStr, yearStr);
  if (areDateFieldsPresent) {
    const isOptionalDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
    if (isOptionalDateValid) {
      const isDateInThePast = checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
      if (isDateInThePast) {
        checkDateIsWithinLast3Months(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS, dayStr, monthStr, yearStr);
      }
    }
  }
  return false;
};

export const checkIdentityDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  // to prevent more than 1 error reported on the date fields we first check for multiple empty fields and then check if the year is correct length or missing before doing the date check as a whole.
  if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)
  && isYearEitherMissingOrCorrectLength(yearStr)
  && checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    checkIdentityDateFields(dayStr, monthStr, yearStr);
  }
  return true;
};

export const checkIdentityDateFields = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const areAllDateFieldsPresent = checkAllDateFieldsArePresent(dayStr, monthStr, yearStr);
  if (areAllDateFieldsPresent) {
    const isDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
    if (isDateValid) {
      const isDatePastOrToday = checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
      if (isDatePastOrToday) {
        checkDateIsWithinLast3Months(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS, dayStr, monthStr, yearStr);
      }
    }
  }
};

export const checkStartDateBeforeDOB = (startDay: string, startMonth: string, startYear: string, dobDay: string, dobMonth: string, dobYear: string) => {
  const startDate = new Date(`${startYear}-${startMonth}-${startDay}`);
  const dobDate = new Date(`${dobYear}-${dobMonth}-${dobDay}`);

  if (dobDate > startDate) {
    throw new Error("Start date must be on or after date of birth");
  }

  return true;
};

export const checkDate = (dayStr: string = "", monthStr: string = "", yearStr: string = ""): boolean => {
  // to prevent more than 1 error reported on the date fields we first check for multiple empty fields and then check if the year is correct length or missing before doing the date check as a whole.
  if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)
  && isYearEitherMissingOrCorrectLength(yearStr)
  && checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    checkAllDateFields(dayStr, monthStr, yearStr);
  }
  return true;
};

export const checkAllDateFields = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const areAllDateFieldsPresent = checkAllDateFieldsArePresent(dayStr, monthStr, yearStr);
  if (areAllDateFieldsPresent) {
    const isDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
    if (isDateValid) {
      checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
    }
  }
};

export const checkDateFieldDay = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (dayStr === "" && monthStr !== "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY);
    } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_AND_MONTH);
    } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
      throw new Error(ErrorMessages.DAY_AND_YEAR);
    } else {
      if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
        throw new Error(ErrorMessages.ENTER_DATE);
      }
    }
  }
  return true;
};

export const checkDateFieldDayOfBirth = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (dayStr === "" && monthStr !== "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_OF_BIRTH);
    } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
    } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
      throw new Error(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
    } else {
      if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
        throw new Error(ErrorMessages.ENTER_DATE_OF_BIRTH);
      }
    }
  }
  return true;
};

export const checkDateFieldDayForOptionalDates = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (dayStr === "" && monthStr !== "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY);
    } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_AND_MONTH);
    } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
      throw new Error(ErrorMessages.DAY_AND_YEAR);
    }
  }
  return true;
};

export const checkDateFieldMonth = (monthMissingMessage: string, monthYearMissingMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (monthStr === "" && dayStr !== "" && yearStr !== "") {
      throw new Error(monthMissingMessage);
    } else if (dayStr !== "" && monthStr === "" && yearStr === "") {
      throw new Error(monthYearMissingMessage);
    }
  }
  return true;
};

export const checkDateFieldYear = (yearMissingMessage: string, yearLengthMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (!isYearEitherMissingOrCorrectLength(yearStr)) {
    throw new Error(yearLengthMessage);
  } else if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)) {
    if (yearStr === "" && dayStr !== "" && monthStr !== "") {
      throw new Error(yearMissingMessage);
    }
  }
  return true;
};

export const checkAllDateFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" || monthStr === "" || yearStr === "") {
    return false;
  }
  return true;
};

export const checkMoreThanOneDateFieldIsNotMissing = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if ((dayStr === "" && monthStr === "" && yearStr !== "") ||
     (dayStr !== "" && monthStr === "" && yearStr === "") ||
     (dayStr === "" && monthStr !== "" && yearStr === "")) {
    return false;
  }
  return true;
};

export const checkFirstDateOnOrAfterSecondDate = (
  firstDayStr: string = "", firstMonthStr: string = "", firstYearStr: string = "",
  secondDayStr: string = "", secondMonthStr: string = "", secondYearStr: string = "",
  errorMessage: string = ErrorMessages.DATE_BEFORE_START_DATE
): boolean => {
  const firstDate = DateTime.utc(Number(firstYearStr), Number(firstMonthStr), Number(firstDayStr));
  const secondDate = DateTime.utc(Number(secondYearStr), Number(secondMonthStr), Number(secondDayStr));

  if (secondDate && secondDate > firstDate) {
    throw new Error(errorMessage);
  }

  return true;
};

export const checkCeasedDateOnOrAfterStartDate = checkFirstDateOnOrAfterSecondDate;

export const checkDateOfBirth = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  // to prevent more than 1 error reported on the date fields we check if the year is correct length or missing before doing the date check as a whole.
  if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)
  && isYearEitherMissingOrCorrectLength(yearStr)
  && checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    const areDateOfBirthFieldsPresent = checkDateOfBirthFieldsArePresent(dayStr, monthStr, yearStr);
    if (areDateOfBirthFieldsPresent) {
      const isDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_BIRTH, dayStr, monthStr, yearStr);
      if (isDateValid) {
        checkDateIsInPast(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST, dayStr, monthStr, yearStr);
      }
    }
  }
  return true;
};

export const checkDateIPIndividualBO = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  checkDateFieldsForErrors({ completelyEmptyDateError: ErrorMessages.ENTER_DATE_INTERESTED_PERSON_INDIVIDUAL_BO } as DateFieldErrors, dayStr, monthStr, yearStr);
  checkAllDateFieldsArePresent(dayStr, monthStr, yearStr) && checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
  checkDateIsInPast(ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON, dayStr, monthStr, yearStr);
  return true;
};

export const checkDateIPLegalEntityBO = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  checkDateFieldsForErrors({ completelyEmptyDateError: ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO } as DateFieldErrors, dayStr, monthStr, yearStr);
  checkAllDateFieldsArePresent(dayStr, monthStr, yearStr) && checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
  checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON, dayStr, monthStr, yearStr);
  return true;
};

export const checkBirthDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO,
    noDayAndMonthError: ErrorMessages.DAY_AND_MONTH_OF_BIRTH,
    noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR_OF_BIRTH,
    noDayAndYearError: ErrorMessages.DAY_AND_YEAR_OF_BIRTH,
  };

  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkAllDateFieldsArePresent(dayStr, monthStr, yearStr) && checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_BIRTH, dayStr, monthStr, yearStr);
  checkDateIsInPast(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST, dayStr, monthStr, yearStr);
  return true;
};

export const checkTrustDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_DATE_OF_TRUST,
    noDayAndMonthError: ErrorMessages.DAY_AND_MONTH_OF_TRUST,
    noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR_OF_TRUST,
    noDayAndYearError: ErrorMessages.DAY_AND_YEAR_OF_TRUST,
  };

  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkAllDateFieldsArePresent(dayStr, monthStr, yearStr) && checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_TRUST, dayStr, monthStr, yearStr);
  checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_TRUST, dayStr, monthStr, yearStr);
  return true;
};

export const checkHistoricalBOStartDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_START_DATE_HISTORICAL_BO,
    noDayAndMonthError: ErrorMessages.START_DAY_AND_MONTH_HISTORICAL_BO,
    noMonthAndYearError: ErrorMessages.START_MONTH_AND_YEAR_HISTORICAL_BO,
    noDayAndYearError: ErrorMessages.START_DAY_AND_YEAR_HISTORICAL_BO,
  };

  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkAllDateFieldsArePresent(dayStr, monthStr, yearStr) && checkDateValueIsValid(ErrorMessages.INVALID_START_DATE_HISTORICAL_BO, dayStr, monthStr, yearStr);
  checkDateIsInPastOrToday(ErrorMessages.START_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO, dayStr, monthStr, yearStr);
  return true;
};

export const checkHistoricalBOEndDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_END_DATE_HISTORICAL_BO,
    noDayAndMonthError: ErrorMessages.END_DAY_AND_MONTH_HISTORICAL_BO,
    noMonthAndYearError: ErrorMessages.END_MONTH_AND_YEAR_HISTORICAL_BO,
    noDayAndYearError: ErrorMessages.END_DAY_AND_YEAR_HISTORICAL_BO,
  };

  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkAllDateFieldsArePresent(dayStr, monthStr, yearStr) && checkDateValueIsValid(ErrorMessages.INVALID_END_DATE_HISTORICAL_BO, dayStr, monthStr, yearStr);
  checkDateIsInPastOrToday(ErrorMessages.END_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO, dayStr, monthStr, yearStr);
  return true;
};

export const checkDateOfBirthFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (!checkAllDateFieldsArePresent(dayStr, monthStr, yearStr)) {
    return false;
  } else {
    checkMoreThanOneDateOfBirthFieldIsNotMissing(dayStr, monthStr, yearStr);
  }
  return true;
};

export type DateFieldErrors = Partial<{
  completelyEmptyDateError: ErrorMessages,
  noDayAndMonthError: ErrorMessages,
  noMonthAndYearError: ErrorMessages,
  noDayAndYearError: ErrorMessages,
}>;

const defaultDateFieldErrors: DateFieldErrors = {
  completelyEmptyDateError: ErrorMessages.ENTER_DATE,
  noDayAndMonthError: ErrorMessages.DAY_AND_MONTH,
  noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR,
  noDayAndYearError: ErrorMessages.DAY_AND_YEAR,
};

export type DayFieldErrors = {
  noDayError: ErrorMessages,
  wrongDayLength: ErrorMessages,
  noRealDay: ErrorMessages,
};

export type MonthFieldErrors = {
  noMonthError: ErrorMessages,
  wrongMonthLength: ErrorMessages,
  noRealMonth: ErrorMessages,
};

export type YearFieldErrors = {
  noYearError: ErrorMessages,
  wrongYearLength: ErrorMessages,
};

export const checkDateFieldsForErrors = (dateErrors: DateFieldErrors, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  dateErrors = { ...defaultDateFieldErrors, ...dateErrors };
  if (dayStr === "" && monthStr === "" && yearStr === "") {
    throw new Error(dateErrors.completelyEmptyDateError);
  } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
    throw new Error(dateErrors.noDayAndMonthError);
  } else if (dayStr !== "" && monthStr === "" && yearStr === "") {
    throw new Error(dateErrors.noMonthAndYearError);
  } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
    throw new Error(dateErrors.noDayAndYearError);
  }
  return true;
};

export const checkDayFieldForErrors = (dateErrors: DayFieldErrors, dayStr: string = "") => {
  if (dayStr === "") {
    throw new Error(dateErrors.noDayError);
  } else if (dayStr.length > 2){
    throw new Error(dateErrors.wrongDayLength);
  }
  return true;
};

export const checkMonthFieldForErrors = (dateErrors: MonthFieldErrors, monthStr: string = "") => {
  if (monthStr === "") {
    throw new Error(dateErrors.noMonthError);
  } else if (monthStr.length > 2){
    throw new Error(dateErrors.wrongMonthLength);
  }
  return true;
};

export const checkYearFieldForErrors = (dateErrors: YearFieldErrors, yearStr: string = "") => {
  if (yearStr === "") {
    throw new Error(dateErrors.noYearError);
  } else if (yearStr.length !== 4){
    throw new Error(dateErrors.wrongYearLength);
  }
  return true;
};

export const checkMoreThanOneDateOfBirthFieldIsNotMissing = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" && monthStr === "" && yearStr !== "") {
    throw new Error(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
  } else if (dayStr !== "" && monthStr === "" && yearStr === "") {
    throw new Error(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
  } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
    throw new Error(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
  }
};

export const checkOverseasName = (value: string = "") => {
  if ( !value.trim() ) {
    throw new Error(ErrorMessages.ENTITY_NAME);
  } else if ( value.length > 160) {
    throw new Error(ErrorMessages.MAX_NAME_LENGTH);
  } else if ( !VALID_CHARACTERS.test(value) ) {
    throw new Error(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
  }

  return true;
};

export const checkSecondNationality = (nationality: string = "", secondNationality: string = "", errors?: DefaultErrorsSecondNationality) => {

  if ( nationality && nationality === secondNationality ) {
    throw new Error(errors?.sameError ?? ErrorMessages.SECOND_NATIONALITY_IS_SAME);
  } else if ( nationality && secondNationality && `${nationality}${CONCATENATED_VALUES_SEPARATOR}${secondNationality}`.length > 50) {
    throw new Error(errors?.lengthError ?? ErrorMessages.NATIONALITIES_TOO_LONG);
  }

  return true;
};

export const checkPublicRegisterJurisdictionLength = (isSelected: boolean, public_register_name: string = "", public_register_jurisdiction: string = "") => {

  if (isSelected && public_register_name && public_register_jurisdiction && `${public_register_name}${CONCATENATED_VALUES_SEPARATOR}${public_register_jurisdiction}`.length > 160) {
    throw new Error(ErrorMessages.MAX_ENTITY_PUBLIC_REGISTER_NAME_AND_JURISDICTION_LENGTH);
  }
  return true;
};

export const checkAtLeastOneFieldHasValue = (errMsg: string, ...fields: any[]) => {
  for (const field of fields) {
    if (field) {
      return true;
    }
  }
  throw new Error(errMsg);
};

export const checkTrustFields = (trustsJson: string) => {
  const trusts: trustType.Trust[] = JSON.parse(trustsJson);
  const addressMaxLength = 50;

  for (const trust of trusts) {
    checkTrustCreationDate(trust);

    checkTrustName(trust);

    checkIndividualsAddress(trust, addressMaxLength);

    checkCorporatesAddress(trust, addressMaxLength);
  }
  return true;
};

export const checkBeneficialOwnerType = (beneficialOwnersStatement: string, value) => {
  if (!value) {
    let errMsg = ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD;
    if (beneficialOwnersStatement === BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS) {
      errMsg = ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_YOU_WANT_TO_ADD;
    } else if (beneficialOwnersStatement === BeneficialOwnersStatementType.NONE_IDENTIFIED) {
      errMsg = ErrorMessages.SELECT_THE_TYPE_OF_MANAGING_OFFICER_YOU_WANT_TO_ADD;
    }
    throw new Error(errMsg);
  }
  return true;
};

export const checkBeneficialOwnersSubmission = (req) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (appData.beneficial_owners_statement === BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS) {
    if (!hasBeneficialOwners(appData)) {
      throw new Error(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
    }
    if (!hasManagingOfficers(appData)) {
      throw new Error(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
    }
  }
  return true;
};

export const checkDatePreviousToFilingDate = (req, dateDay: string, dateMonth: string, dateYear: string, errorMessage: string) => {
  const appData: ApplicationData = getApplicationData(req.session);

  const filingDateDay = appData?.update?.[FilingDateKey]?.day;
  const filingDateMonth = appData?.update?.[FilingDateKey]?.month;
  const filingDateYear = appData?.update?.[FilingDateKey]?.year;

  return checkFirstDateOnOrAfterSecondDate(
    filingDateDay, filingDateMonth, filingDateYear,
    dateDay, dateMonth, dateYear,
    errorMessage);
};

const hasBeneficialOwners = (appData: ApplicationData) => {
  return (appData.beneficial_owners_individual && appData.beneficial_owners_individual.length > 0) ||
    (appData.beneficial_owners_corporate && appData.beneficial_owners_corporate.length > 0) ||
    (appData.beneficial_owners_government_or_public_authority &&
      appData.beneficial_owners_government_or_public_authority.length > 0);
};

const hasManagingOfficers = (appData: ApplicationData) => {
  return (appData.managing_officers_individual && appData.managing_officers_individual.length > 0) ||
    (appData.managing_officers_corporate && appData.managing_officers_corporate.length > 0);
};

const checkTrustCreationDate = (trust: trustType.Trust) => {
  if (trust.creation_date_day === undefined ||
    trust.creation_date_day === "" ||
    trust.creation_date_month === undefined ||
    trust.creation_date_month === "" ||
    trust.creation_date_year === undefined ||
    trust.creation_date_year === "") {
    throw new Error(ErrorMessages.TRUST_CREATION_DATE);
  }
};

const checkTrustName = (trust: trustType.Trust) => {
  if (trust.trust_name === undefined || trust.trust_name === "") {
    throw new Error(ErrorMessages.TRUST_NAME);
  }
};

const checkIndividualsAddress = (trust: trustType.Trust, addressMaxLength: number) => {
  if (trust.INDIVIDUALS) {
    for (const individual of trust.INDIVIDUALS) {
      if (individual.ura_address_premises && individual.ura_address_premises.length > addressMaxLength) {
        throw new Error(ErrorMessages.TRUST_INDIVIDUAL_HOME_ADDRESS_LENGTH);
      }
      if (individual.sa_address_premises && individual.sa_address_premises.length > addressMaxLength) {
        throw new Error(ErrorMessages.TRUST_INDIVIDUAL_CORRESPONDENCE_ADDRESS_LENGTH);
      }
    }
  }
};

const checkCorporatesAddress = (trust: trustType.Trust, addressMaxLength: number) => {
  if (trust.CORPORATES) {
    for (const corporate of trust.CORPORATES) {
      if (corporate.ro_address_premises && corporate.ro_address_premises.length > addressMaxLength) {
        throw new Error(ErrorMessages.TRUST_CORPORATE_REGISTERED_OFFICE_ADDRESS_LENGTH);
      }
      if (corporate.sa_address_premises && corporate.sa_address_premises.length > addressMaxLength) {
        throw new Error(ErrorMessages.TRUST_CORPORATE_CORRESPONDENCE_ADDRESS_LENGTH);
      }
    }
  }
};

export const validateEmail = (email: string, maxLength: number) => {
  const emailString = email.trim();
  checkEmailIsPresent(emailString);
  checkIsWithinLengthLimit(emailString, maxLength);
  checkCorrectIsFormat(emailString);
  return true;
};

const checkEmailIsPresent = (email: string) => {
  if (email === undefined || email === "") {
    throw new Error(ErrorMessages.EMAIL);
  }
};

const checkIsWithinLengthLimit = (email: string, maxLength: number) => {
  if (email.length > maxLength) {
    throw new Error(ErrorMessages.MAX_EMAIL_LENGTH);
  }
};

const checkCorrectIsFormat = (email: string) => {
  if (!email.match(VALID_EMAIL_FORMAT)) {
    throw new Error(ErrorMessages.EMAIL_INVALID_FORMAT);
  }
};

/**
 * @param formData : req.body
 * @param keys : req.body[keys]
 * @param radioButtonSelected : if value selected is '0'
 * @returns boolean
 */
export const addressFieldsHaveNoValue = (formData: any, keys: string[], radioButtonSelected: boolean) => {
  if (radioButtonSelected){
    return Promise.resolve(keys.every(key => formData[`${key}`] === "" ));
  }
  return false;
};

/**
 *
 * @param allEmpty : Checks if all correspondence fields empty
 * @param selected : check if radio button selected for correspondence address
 * @param errMsg : Message to be thrown if there is an error
 * @param value : Address field value
 * @param isPrimaryField : Throw error if field is a primary field
 * @returns
 */
export const checkFieldIfRadioButtonSelectedAndFieldsEmpty = (isPrimaryField: boolean, allEmpty: boolean, selected: boolean, errMsg: string, value: string = "") => {
  if (!allEmpty) {
    checkFieldIfRadioButtonSelected(selected, errMsg, value);
  } else {
    if (isPrimaryField){
      throw new Error(ErrorMessages.ENTITY_CORRESPONDENCE_ADDRESS);
    } else {
      return false;
    }
  }
};
