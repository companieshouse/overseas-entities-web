import { DateTime } from "luxon";

export const DATE_OF_BIRTH = {
  "date_of_birth-day": "1",
  "date_of_birth-month": "1",
  "date_of_birth-year": "2000",
};

export const START_DATE = {
  "start_date-day": "1",
  "start_date-month": "1",
  "start_date-year": "2022",
};

export const IDENTITY_DATE_REQ_BODY_MOCK = {
  "identity_date-day": "1",
  "identity_date-month": "1",
  "identity_date-year": "2022",
};

export const EMPTY_IDENTITY_DATE_REQ_BODY_MOCK = {
  "identity_date-day": "",
  "identity_date-month": "",
  "identity_date-year": "",
};

export const DATE = { day: "1", month: "1", year: "2000" };
export const EMPTY_DATE = { day: "", month: "", year: "" };

export const getTwoMonthOldDate = (): DateTime => {
  const now = DateTime.now();
  return DateTime.utc(now.year, now.month, now.day).minus({ months: 2 });
};
