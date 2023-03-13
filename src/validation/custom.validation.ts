// Custom validation utils - For now checking is not empty

import { Session } from '@companieshouse/node-session-handler';

import { VALID_CHARACTERS, VALID_EMAIL_FORMAT } from "./regex/regex.validation";
import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";
import { ApplicationData, trustType } from "../model";
import { BeneficialOwnersStatementType } from "../model/beneficial.owner.statement.model";
import { CONCATENATED_VALUES_SEPARATOR } from "../config";
import { getApplicationData } from "../utils/application.data";

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

const isYearEitherMissingOrCorrectLength = (yearStr: string = ""): boolean => {
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

const checkOptionalDateDetails = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
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

const checkIdentityDateFields = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
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

export const checkStartDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  // to prevent more than 1 error reported on the date fields we first check for multiple empty fields and then check if the year is correct length or missing before doing the date check as a whole.
  if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)
  && isYearEitherMissingOrCorrectLength(yearStr)
  && checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    checkStartDateFields(dayStr, monthStr, yearStr);
  }
  return true;
};

const checkStartDateFields = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
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

export const checkDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  checkDateFieldsForErrors({} as DateFieldErrors, dayStr, monthStr, yearStr);
  checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
  checkDateIsInPast(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
  return true;
};

export const checkBirthDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO,
    noDayAndMonthError: ErrorMessages.DAY_AND_MONTH_OF_BIRTH,
    noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR_OF_BIRTH,
    noDayAndYearError: ErrorMessages.DAY_AND_YEAR_OF_BIRTH,
    noDayError: ErrorMessages.DAY_OF_BIRTH,
    noMonthError: ErrorMessages.MONTH_OF_BIRTH,
    noYear: ErrorMessages.YEAR_OF_BIRTH,
    wrongDayLength: ErrorMessages.DATE_OF_BIRTH_DAY_LENGTH,
    wrongMonthLength: ErrorMessages.DATE_OF_BIRTH_MONTH_LENGTH,
    wrongYearLength: ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH
  };
  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_BIRTH, dayStr, monthStr, yearStr);
  checkDateIsInPast(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST, dayStr, monthStr, yearStr);
  return true;
};

export const checkTrustDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_DATE_OF_TRUST,
    noDayAndMonthError: ErrorMessages.DAY_AND_MONTH_OF_TRUST,
    noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR_OF_TRUST,
    noDayAndYearError: ErrorMessages.DAY_AND_YEAR_OF_TRUST,
    noDayError: ErrorMessages.DAY_OF_TRUST,
    noMonthError: ErrorMessages.MONTH_OF_TRUST,
    noYear: ErrorMessages.YEAR_OF_TRUST,
    wrongDayLength: ErrorMessages.DAY_LENGTH_OF_TRUST,
    wrongMonthLength: ErrorMessages.MONTH_LENGTH_OF_TRUST,
    wrongYearLength: ErrorMessages.YEAR_LENGTH_OF_TRUST
  };
  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_TRUST, dayStr, monthStr, yearStr);
  checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_TRUST, dayStr, monthStr, yearStr);
  return true;
};

export const checkHistoricalBOStartDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_START_DATE_HISTORICAL_BO,
    noDayAndMonthError: ErrorMessages.START_DAY_AND_MONTH_HISTORICAL_BO,
    noMonthAndYearError: ErrorMessages.START_MONTH_AND_YEAR_HISTORICAL_BO,
    noDayAndYearError: ErrorMessages.START_DAY_AND_YEAR_HISTORICAL_BO,
    noDayError: ErrorMessages.START_DAY_HISTORICAL_BO,
    noMonthError: ErrorMessages.START_MONTH_HISTORICAL_BO,
    noYear: ErrorMessages.START_YEAR_HISTORICAL_BO,
    wrongDayLength: ErrorMessages.START_DAY_LENGTH_HISTORICAL_BO,
    wrongMonthLength: ErrorMessages.START_MONTH_LENGTH_HISTORICAL_BO,
    wrongYearLength: ErrorMessages.START_YEAR_LENGTH_HISTORICAL_BO
  };

  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkDateValueIsValid(ErrorMessages.INVALID_START_DATE_HISTORICAL_BO, dayStr, monthStr, yearStr);
  checkDateIsInPastOrToday(ErrorMessages.START_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO, dayStr, monthStr, yearStr);
  return true;
};

export const checkHistoricalBOEndDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const dateFieldErrors = {
    completelyEmptyDateError: ErrorMessages.ENTER_END_DATE_HISTORICAL_BO,
    noDayAndMonthError: ErrorMessages.END_DAY_AND_MONTH_HISTORICAL_BO,
    noMonthAndYearError: ErrorMessages.END_MONTH_AND_YEAR_HISTORICAL_BO,
    noDayAndYearError: ErrorMessages.END_DAY_AND_YEAR_HISTORICAL_BO,
    noDayError: ErrorMessages.END_DAY_HISTORICAL_BO,
    noMonthError: ErrorMessages.END_MONTH_HISTORICAL_BO,
    noYear: ErrorMessages.END_YEAR_HISTORICAL_BO,
    wrongDayLength: ErrorMessages.END_DAY_LENGTH_HISTORICAL_BO,
    wrongMonthLength: ErrorMessages.END_MONTH_LENGTH_HISTORICAL_BO,
    wrongYearLength: ErrorMessages.END_YEAR_LENGTH_HISTORICAL_BO
  };

  checkDateFieldsForErrors(dateFieldErrors, dayStr, monthStr, yearStr);
  checkDateValueIsValid(ErrorMessages.INVALID_END_DATE_HISTORICAL_BO, dayStr, monthStr, yearStr);
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

const checkDateFieldLengthForErrors = (day: string, month: string, year: string, errors: ErrorMessages[]) => {
  if (day.length > 2) {
    throw new Error(errors[0]);
  }
  if (month.length > 2) {
    throw new Error(errors[1]);
  }
  if (year.length !== 4) {
    throw new Error(errors[2]);
  }
};

export type DateFieldErrors = Partial<{
  completelyEmptyDateError: ErrorMessages,
  noDayAndMonthError: ErrorMessages,
  noMonthAndYearError: ErrorMessages,
  noDayAndYearError: ErrorMessages,
  noDayError: ErrorMessages,
  noMonthError: ErrorMessages,
  noYear: ErrorMessages,
  wrongDayLength: ErrorMessages,
  wrongMonthLength: ErrorMessages,
  wrongYearLength: ErrorMessages,
}>;

const defaultDateFieldErrors: DateFieldErrors = {
  completelyEmptyDateError: ErrorMessages.ENTER_DATE,
  noDayAndMonthError: ErrorMessages.DAY_AND_MONTH,
  noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR,
  noDayAndYearError: ErrorMessages.DAY_AND_YEAR,
  noDayError: ErrorMessages.DAY,
  noMonthError: ErrorMessages.MONTH,
  noYear: ErrorMessages.YEAR,
  wrongDayLength: ErrorMessages.DAY_LENGTH,
  wrongMonthLength: ErrorMessages.MONTH_LENGTH,
  wrongYearLength: ErrorMessages.YEAR_LENGTH,
};

const checkDateFieldsForErrors = (dateErrors: DateFieldErrors, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  dateErrors = { ...defaultDateFieldErrors, ...dateErrors };
  if (dayStr === "" && monthStr === "" && yearStr === "") {
    throw new Error(dateErrors.completelyEmptyDateError);
  } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
    throw new Error(dateErrors.noDayAndMonthError);
  } else if (dayStr !== "" && monthStr === "" && yearStr === "") {
    throw new Error(dateErrors.noMonthAndYearError);
  } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
    throw new Error(dateErrors.noDayAndYearError);
  } else if (dayStr === "") {
    throw new Error(dateErrors.noDayError);
  } else if (monthStr === "") {
    throw new Error(dateErrors.noMonthError);
  } else if (yearStr === "") {
    throw new Error(dateErrors.noYear);
  } else {
    checkDateFieldLengthForErrors(dayStr, monthStr, yearStr, [
      dateErrors.wrongDayLength ?? ErrorMessages.DAY_LENGTH,
      dateErrors.wrongMonthLength ?? ErrorMessages.MONTH_LENGTH,
      dateErrors.wrongYearLength ?? ErrorMessages.YEAR_LENGTH]);
  }
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

export const checkSecondNationality = (nationality: string = "", secondNationality: string = "") => {

  if ( nationality && nationality === secondNationality ) {
    throw new Error(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
  } else if ( nationality && secondNationality && `${nationality}${CONCATENATED_VALUES_SEPARATOR}${secondNationality}`.length > 50) {
    throw new Error(ErrorMessages.NATIONALITIES_TOO_LONG);
  }

  return true;
};

export const checkPublicRegisterJurisdictionLength = (public_register_name: string = "", public_register_jurisdiction: string = "") => {

  if (public_register_name && public_register_jurisdiction && `${public_register_name}${CONCATENATED_VALUES_SEPARATOR}${public_register_jurisdiction}`.length > 160) {
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

const isSubmitTrustSelected = (session: Session, action: string = ""): boolean => {
  const appData: ApplicationData = getApplicationData(session);
  return action === "submit" && (appData.trusts || [] ).length > 0;
};

export const checkTrustBO = (req) => {
  if (isSubmitTrustSelected(req.session, req.body.submit)) {
    return true;
  }
  return checkAtLeastOneFieldHasValue(ErrorMessages.TRUST_BO_CHECKBOX, req.body.beneficialOwners);
};

export const checkTrustFields = (req) => {

  if (isSubmitTrustSelected(req.session, req.body.submit)) {
    return true;
  }

  const trustsJson = (req.body.trusts || "").trim();

  if (!trustsJson) {
    throw new Error(ErrorMessages.TRUST_DATA_EMPTY);
  }

  if (!isValidJson(trustsJson)) {
    throw new Error(ErrorMessages.TRUST_DATA_INVALID_FORMAT);
  }

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

const isValidJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
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
