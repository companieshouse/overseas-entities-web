import { lowerCaseAllWordsExceptFirstLetters, mapInputDate, splitOriginatingRegistryName } from "../../../src/utils/update/mapper.utils";

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

  test("returns undefined for undefined date", () => {
    const InputDate = mapInputDate(undefined);
    expect(InputDate).toEqual(undefined);
  });

  test("returns empty string for date with month and year", () => {
    const InputDate = mapInputDate("2022-07");
    expect(InputDate).toEqual({ day: "", month: "7", year: "2022" });
  });

  describe("splitOriginatingRegistryName", () => {
    test.each([
      ["Undefined returns empty strings", undefined, ["", ""]],
      ["Empty string returns empty strings", "", ["", ""]],
      [
        "One comma occurence splits correctly",
        "Public Register Name,Country",
        ["Public Register Name", "Country"]
      ],
      [
        "Multiple comma occurences in country splits correctly",
        "Public Register Name, Virgin Islands, U.S.",
        ["Public Register Name", "Virgin Islands, U.S."]
      ],
      [
        "Leading whitespace on country is removed",
        "Public Register Name, Country",
        ["Public Register Name", "Country"]
      ]
    ])(`%s`, (_, stringToSplit, expectedResult) => {

      expect(splitOriginatingRegistryName(stringToSplit as string)).toEqual(expectedResult);
    });
  });

  describe("lowerCaseAllWordsExceptFirstLetters", () => {
    test.each([
      ["FRANCE", "France"],
      ["BOSNIA AND HERZEGOVINA", "Bosnia and Herzegovina"],
      ["ISLE OF MAN", "Isle of Man"],
      ["SAINT VINCENT AND THE GRENADINES", "Saint Vincent and the Grenadines"],
      ["BRITISH INDIAN OCEAN TERRITORY", "British Indian Ocean Territory"],
      ["SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA", "Saint Helena, Ascension and Tristan da Cunha"],
      ["SINT MAARTEN (DUTCH PART)", "Sint Maarten (Dutch part)"],
      ["GUINEA-BISSAU", "Guinea-Bissau"]
    ])(`Correctly reformats %s`, (str, expectedResult) => {
      expect(lowerCaseAllWordsExceptFirstLetters(str)).toEqual(expectedResult);
    });
  });
});
