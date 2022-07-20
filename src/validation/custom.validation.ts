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

export const checkMandatoryTrustFields = (nameErrMsg, dateErrMsg, trusts_json: string) => {
  const trusts: trustType.Trust[] = JSON.parse(trusts_json);
  for (const trust of trusts) {
    if (
      trust.creation_date_day === undefined ||
      trust.creation_date_day === "" ||
      trust.creation_date_month === undefined ||
      trust.creation_date_month === "" ||
      trust.creation_date_year === undefined ||
      trust.creation_date_year === ""
    ) {
      throw new Error(dateErrMsg);
    }
    if (trust.trust_name === undefined || trust.trust_name === "") {
      throw new Error(nameErrMsg);
    }
  };
  return true;
};
