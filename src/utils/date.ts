import { DateTime } from "luxon";

export interface DateAsStrings {
    day: string,
    month: string,
    year: string
}

export const getTodaysDate = (): DateAsStrings => {
  const now = DateTime.now().toUTC();
  return {
    day: "" + now.day,
    month: "" + now.month,
    year: "" + now.year
  };
};
