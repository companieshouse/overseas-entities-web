import { DateTime } from "luxon";
import { InputDate } from "../model/data.types.model";

export const getTodaysDate = (): InputDate => {
  const now = DateTime.now().toUTC();
  return {
    day: "" + now.day,
    month: "" + now.month,
    year: "" + now.year
  };
};

export const convertIsoDateToInputDate = (isoDateString: string): InputDate => {
  const parsedDate = DateTime.fromISO(isoDateString);
  const day = parsedDate.toFormat('dd'); // Ensure two-digit day
  const month = parsedDate.toFormat('LL'); // Ensure two-digit month
  const year = parsedDate.toFormat('yyyy');
  return { day, month, year };
};
