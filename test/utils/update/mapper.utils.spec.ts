import { mapInputDate } from "../../../src/utils/update/mapper.utils";

describe("Test mapping utils", () => {
  test("does map date of creation for month format containing single digit ", () => {
    const InputDate = mapInputDate("2022-7-21");
    expect(InputDate).toEqual({ day: "21", month: "7", year: "2022" });
  });

  test("does map date of creation for day format containing single digit ", () => {
    const InputDate = mapInputDate("2022-7-01");
    expect(InputDate).toEqual({ day: "1", month: "7", year: "2022" });
  });

  test("does map date of creation for month format containing two digits", () => {
    const InputDate = mapInputDate("2022-12-21");
    expect(InputDate).toEqual({ day: "21", month: "12", year: "2022" });
  });

  test("does map date of creation and strips leading 0", () => {
    const InputDate = mapInputDate("2022-07-21");
    expect(InputDate).toEqual({ day: "21", month: "7", year: "2022" });
  });

  test("returns empty string for undefined date", () => {
    const InputDate = mapInputDate(undefined);
    expect(InputDate).toEqual({ day: "", month: "", year: "" });
  });

  test("returns empty string for date with month and year", () => {
    const InputDate = mapInputDate("2022-07");
    expect(InputDate).toEqual({ day: "", month: "7", year: "2022" });
  });

});
