import { checkCeasedDateOnOrAfterStartDate } from "../../src/validation/custom.validation";
import { ErrorMessages } from "../../src/validation/error.messages";

describe('checkCeasedDateOnOrAfterStartDate', () => {

  test('should throw error if ceased date before start date', () => {
    const ceaseDate = ["2", "2", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(() => checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toThrowError(ErrorMessages.CEASED_DATE_BEFORE_START_DATE);
  });

  test('should return true if ceased date after start date', () => {
    const ceaseDate = ["3", "3", "2023"];
    const startDate = ["2", "2", "2023"];

    expect(checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toBe(true);
  });

  test('should return true if ceased date = start date', () => {
    const ceaseDate = ["3", "3", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toBe(true);
  });
});
