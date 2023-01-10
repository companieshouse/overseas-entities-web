// Custom validation utils - For now checking is not empty

import { VALID_CHARACTERS } from "./regex/regex.validation";
import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";
import { trustType } from "../model";
import { BeneficialOwnersStatementType } from "../model/beneficial.owner.statement.model";
import { CONCATENATED_VALUES_SEPARATOR } from "../config";

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

export const checkDateIsNotCompletelyEmpty = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  if ( !day.trim() && !month.trim() && !year.trim() ) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsInPast = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const currentDate = DateTime.utc(now.year, now.month, now.day); // exclude time of day
  if (inputDate  >= currentDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsInPastOrToday = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const currentDate = DateTime.utc(now.year, now.month, now.day); // exclude time of day
  if (inputDate  > currentDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsWithinLast3Months = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const threeMonthOldDate =  DateTime.utc(now.year, now.month, now.day).minus({ months: 3 });
  if (inputDate <= threeMonthOldDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateValueIsValid = (errMsg: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if (isNaN(day) || isNaN(month) || isNaN(year) || !DateTime.utc(year, month, day).isValid) {
    throw new Error(errMsg);
  } else if (yearStr.length !== 4) {
    throw new Error(ErrorMessages.YEAR_LENGTH);
  }

  return true;
};

export const checkOptionalDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if ( dayStr !== "" || monthStr !== "" || yearStr !== "" ) {
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
  }
  return true;
};

export const checkIdentityDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const isDatePresent = checkDateIsNotCompletelyEmpty(ErrorMessages.ENTER_DATE, dayStr, monthStr, yearStr);
  if (isDatePresent) {
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
  }
  return true;
};

export const checkStartDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const isDatePresent = checkDateIsNotCompletelyEmpty(ErrorMessages.ENTER_DATE, dayStr, monthStr, yearStr);
  if (isDatePresent) {
    const areAllDateFieldsPresent = checkAllDateFieldsArePresent(dayStr, monthStr, yearStr);
    if (areAllDateFieldsPresent) {
      const isDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
      if (isDateValid) {
        checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
      }
    }
  }
  return true;
};

export const checkDateFieldDay = (message: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" && monthStr !== "" && yearStr !== "") {
    throw new Error(message);
  }
  return true;
};

export const checkDateFieldMonth = (message: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (monthStr === "" && dayStr !== "" && yearStr !== "") {
    throw new Error(message);
  }
  return true;
};

export const checkDateFieldYear = (message: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (yearStr === "" && dayStr !== "" && monthStr !== "") {
    throw new Error(message);
  }
  return true;
};

export const checkAllDateFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" && monthStr !== "" && yearStr !== "") {
    return false;
  } else if (monthStr === "" && dayStr !== "" && yearStr !== "") {
    return false;
  } else if (yearStr === "" && dayStr !== "" && monthStr !== "") {
    return false;
  } else if ((dayStr === "" && monthStr === "") || (dayStr === "" && yearStr === "") || (monthStr === "" && yearStr === "")) {
    throw new Error(ErrorMessages.INVALID_DATE);
  }
  return true;
};

export const checkDateOfBirth = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const isDatePresent = checkDateIsNotCompletelyEmpty(ErrorMessages.ENTER_DATE_OF_BIRTH, dayStr, monthStr, yearStr);
  if (isDatePresent) {
    const areDateOfBirthFieldsPresent = checkDateOfBirthFieldsArePresent(dayStr, monthStr, yearStr);
    if (areDateOfBirthFieldsPresent) {
      const isDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE_OF_BIRTH, dayStr, monthStr, yearStr);
      if (isDateValid) {
        checkDateIsInPast(ErrorMessages.DATE_NOT_IN_PAST, dayStr, monthStr, yearStr);
      }
    }
  }
  return true;
};

export const checkDateOfBirthFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" && monthStr !== "" && yearStr !== "") {
    return false;
  } else if (monthStr === "" && dayStr !== "" && yearStr !== "") {
    return false;
  } else if (yearStr === "" && dayStr !== "" && monthStr !== "") {
    return false;
  } else if ((dayStr === "" && monthStr === "") || (dayStr === "" && yearStr === "") || (monthStr === "" && yearStr === "")) {
    throw new Error(ErrorMessages.INVALID_DATE_OF_BIRTH);
  }
  return true;
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

export const checkPublicRegisterJurisdiction = (public_register_name: string = "", public_register_jurisdiction: string = "") => {

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
