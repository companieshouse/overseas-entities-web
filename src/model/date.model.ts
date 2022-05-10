/*
  DateOfBirthKey and StartDateKey should match the date name field
  in every data model where date object has been used
*/

export const DateOfBirthKey: string = "date_of_birth";
export const StartDateKey: string = "start_date";

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
