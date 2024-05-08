import { DateTime } from "luxon";
import { convertIsoDateToInputDate, getTodaysDate } from "../../src/utils/date";
import { InputDate } from "../../src/model/data.types.model";

describe("date utils tests", () => {
  test("getTodaysDate should return today's date", () => {
    const todayDateTime = DateTime.utc();

    const todaysDate: InputDate = getTodaysDate();

    expect(typeof todaysDate.day).toEqual("string");
    expect(typeof todaysDate.month).toEqual("string");
    expect(typeof todaysDate.year).toEqual("string");

    expect("" + todayDateTime.day).toEqual(todaysDate.day);
    expect("" + todayDateTime.month).toEqual(todaysDate.month);
    expect("" + todayDateTime.year).toEqual(todaysDate.year);
  });

  test("convertIsoDateToInputDate should convert ISO date to an InputDate with leading zeros", () => {
    const convertedDate: InputDate = convertIsoDateToInputDate("2024-02-06");

    expect(convertedDate.day).toEqual("06");
    expect(convertedDate.month).toEqual("02");
    expect(convertedDate.year).toEqual("2024");
  });

  test("convertIsoDateToInputDate should convert ISO date to an InputDate without leading zeros", () => {
    const convertedDate: InputDate = convertIsoDateToInputDate("2024-12-26");

    expect(convertedDate.day).toEqual("26");
    expect(convertedDate.month).toEqual("12");
    expect(convertedDate.year).toEqual("2024");
  });

  test("convertIsoDateToInputDate should return NaN values if input date not in ISO format", () => {
    const convertedDate: InputDate = convertIsoDateToInputDate("26-12-2024");

    expect(convertedDate.day).toEqual("NaN");
    expect(convertedDate.month).toEqual("NaN");
    expect(convertedDate.year).toEqual("NaN");
  });

  test("convertIsoDateToInputDate should return NaN values if input date is empty", () => {
    const convertedDate: InputDate = convertIsoDateToInputDate("");

    expect(convertedDate.day).toEqual("NaN");
    expect(convertedDate.month).toEqual("NaN");
    expect(convertedDate.year).toEqual("NaN");
  });

  test("convertIsoDateToInputDate should return NaN values if input date is undefined", () => {
    const convertedDate: InputDate = convertIsoDateToInputDate(undefined as unknown as string);

    expect(convertedDate.day).toEqual("NaN");
    expect(convertedDate.month).toEqual("NaN");
    expect(convertedDate.year).toEqual("NaN");
  });
});
