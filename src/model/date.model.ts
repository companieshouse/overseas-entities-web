/*
  DateOfBirthKey, StartDateKey and IdentityDateKey should match the date name field
  in every data model where date object has been used
*/

export const DateOfBirthKey: string = "date_of_birth";
export const StartDateKey: string = "start_date";
export const IdentityDateKey: string = "identity_date";
export const CeasedDateKey: string = "ceased_date";
export const ResignedOnKey: string = "resigned_on";
export const FilingDateKey: string = "filing_date";
export const ResignedOnDateKey: string = "resigned_on";
export const HaveDayOfBirthKey = "have_day_of_birth";

/*
  The sub-fields for Date Objects used in the templates
*/
export const DateOfBirthKeys: string[] = [
  "date_of_birth-day",
  "date_of_birth-month",
  "date_of_birth-year",
];

export const StartDateKeys: string[] = [
  "start_date-day",
  "start_date-month",
  "start_date-year",
];

export const IdentityDateKeys: string[] = [
  "identity_date-day",
  "identity_date-month",
  "identity_date-year",
];

export const CeasedDateKeys: string[] = [
  "ceased_date-day",
  "ceased_date-month",
  "ceased_date-year",
];

export const FilingDateKeys: string[] = [
  "filing_date-day",
  "filing_date-month",
  "filing_date-year",
];

export const ResignedOnDateKeys: string[] = [
  "resigned_on-day",
  "resigned_on-month",
  "resigned_on-year",
];
