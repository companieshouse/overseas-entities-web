import { DateTime } from "luxon";
import { DateAsStrings, getTodaysDate } from "../../src/utils/date";

describe("date utils tests", () => {
  test("getTodaysDate should return today's date", () => {
    const todayDateTime = DateTime.utc();

    const todaysDate: DateAsStrings = getTodaysDate();

    expect(typeof todaysDate.day).toEqual("string");
    expect(typeof todaysDate.month).toEqual("string");
    expect(typeof todaysDate.year).toEqual("string");

    expect("" + todayDateTime.day).toEqual(todaysDate.day);
    expect("" + todayDateTime.month).toEqual(todaysDate.month);
    expect("" + todayDateTime.year).toEqual(todaysDate.year);
  });
});
