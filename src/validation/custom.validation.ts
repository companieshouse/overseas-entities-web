// Custom validation utils - For now checking is not empty

import { VALID_CHARACTERS } from "./regex/regex.validation";
import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";
import { trustType } from "../model";

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

export const checkDate = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  if ( !day.trim() || !month.trim() || !year.trim() ) {
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
  }

  return true;
};

export const checkOptionalDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if ( dayStr !== "" || monthStr !== "" || yearStr !== "" ) {
    checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
    checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
    checkDateIsWithinLast3Months(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS, dayStr, monthStr, yearStr);
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

export const checkMandatoryTrustFields = (trustsJson: string) => {
  const trusts: trustType.Trust[] = JSON.parse(trustsJson);

  for (const trust of trusts) {
    if (
      trust.creation_date_day === undefined ||
      trust.creation_date_day === "" ||
      trust.creation_date_month === undefined ||
      trust.creation_date_month === "" ||
      trust.creation_date_year === undefined ||
      trust.creation_date_year === ""
    ) {
      throw new Error(ErrorMessages.TRUST_CREATION_DATE);
    }

    if (trust.trust_name === undefined || trust.trust_name === "") {
      throw new Error(ErrorMessages.TRUST_NAME);
    }

    const addressMaxLength = 50;

    if (trust.INDIVIDUALS) {
      for (const individual of trust.INDIVIDUALS) {
        if (individual.ura_address_premises?.length > addressMaxLength) {
          throw new Error(ErrorMessages.TRUST_INDIVIDUAL_HOME_ADDRESS_LENGTH);
        }
        if (individual.sa_address_premises?.length > addressMaxLength) {
          throw new Error(ErrorMessages.TRUST_INDIVIDUAL_CORRESPONDENCE_ADDRESS_LENGTH);
        }
      }
    }

    if (trust.CORPORATES) {
      for (const corporate of trust.CORPORATES) {
        if (corporate.ro_address_premises?.length > addressMaxLength) {
          throw new Error(ErrorMessages.TRUST_CORPORATE_REGISTERED_OFFICE_ADDRESS_LENGTH);
        }
        if (corporate.sa_address_premises?.length > addressMaxLength) {
          throw new Error(ErrorMessages.TRUST_CORPORATE_CORRESPONDENCE_ADDRESS_LENGTH);
        }
      }
    }
  }
  return true;
};
