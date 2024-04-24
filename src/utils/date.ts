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
