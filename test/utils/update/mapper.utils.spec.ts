import { lowerCaseAllWordsExceptFirstLetters, mapBOIndividualName, mapInputDate } from "../../../src/utils/update/mapper.utils";

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

  test("returns string for name with forename and middlename", () => {
    const nameElements = { forename: "First", middleName: "middle", surname: "surname" };
    const firstName = mapBOIndividualName(nameElements);
    expect(firstName).toEqual("First middle");
  });

  test("returns string for name with forename and empty middlename", () => {
    const nameElements = { forename: "First", middleName: " ", surname: "surname" };
    const firstName = mapBOIndividualName(nameElements);
    expect(firstName).toEqual("First");
  });

  test("returns string for name with forename and undefined middlename", () => {
    const nameElements = { forename: "First", surname: "surname" };
    const firstName = mapBOIndividualName(nameElements);
    expect(firstName).toEqual("First");
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
