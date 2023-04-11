/*
  DateOfBirthKey, StartDateKey and IdentityDateKey should match the date name field
  in every data model where date object has been used
*/

export const DateOfBirthKey: string = "date_of_birth";
export const StartDateKey: string = "start_date";
export const IdentityDateKey: string = "identity_date";
export const CeasedDateKey: string = "ceased_date";

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
