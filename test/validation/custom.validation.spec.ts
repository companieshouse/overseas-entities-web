jest.mock('../../src/utils/application.data');

import * as custom from "../../src/validation/custom.validation";
import { ErrorMessages } from "../../src/validation/error.messages";
import { DateTime } from 'luxon';
import { MAX_80 } from "../__mocks__/max.length.mock";
import { getApplicationData } from "../../src/utils/application.data";
import { Request } from "express";
import { Session } from '@companieshouse/node-session-handler';

const public_register_name = MAX_80 + "1";
const public_register_jurisdiction = MAX_80;

describe('checkCeasedDateOnOrAfterStartDate', () => {

  test('should throw error if ceased date before start date', () => {
    const ceaseDate = ["2", "2", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(() => custom.checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate, ErrorMessages.CEASED_DATE_BEFORE_START_DATE)).toThrowError(ErrorMessages.CEASED_DATE_BEFORE_START_DATE);
  });

  test('should return true if ceased date after start date', () => {
    const ceaseDate = ["3", "3", "2023"];
    const startDate = ["2", "2", "2023"];

    expect(custom.checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toBe(true);
  });

  test('should return true if ceased date = start date', () => {
    const ceaseDate = ["3", "3", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(custom.checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toBe(true);
  });

  test('should throw error if filing date before start date', () => {
    const filingDate = ["2", "2", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(() => custom.checkFirstDateOnOrAfterSecondDate(...filingDate, ...startDate, ErrorMessages.START_DATE_BEFORE_FILING_DATE))
      .toThrowError(ErrorMessages.START_DATE_BEFORE_FILING_DATE);
  });

  test('should return true if filing date = start date', () => {
    const filingDate = ["3", "3", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(custom.checkFirstDateOnOrAfterSecondDate(...filingDate, ...startDate)).toBe(true);
  });

  test('should return true if filing date after start date', () => {
    const filingDate = ["3", "3", "2023"];
    const startDate = ["2", "2", "2023"];

    expect(custom.checkFirstDateOnOrAfterSecondDate(...filingDate, ...startDate)).toBe(true);
  });

  test("should test checkFieldIfRadioButtonSelectedAndFieldsEmpty validity", () => {
    const errorMsg = "kaput";
    expect(() => custom.checkFieldIfRadioButtonSelectedAndFieldsEmpty(true, true, true, errorMsg)).toThrowError("Enter their correspondence address");
    expect(custom.checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, true, true, errorMsg)).toBe(false);
    expect(() => custom.checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, false, true, errorMsg)).toThrowError(errorMsg);
    expect(custom.checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, false, false, errorMsg)).toBeFalsy();
  });
});

describe('tests for checking length of day and month ', () => {
  test('should throw error if day field is greater than 2 digits', () => {
    expect(() => custom.checkDateFieldDay("001", "1", "2023")).toThrowError(ErrorMessages.DAY_LENGTH);
  });

  test('should throw error if month field is greater than 2 digits', () => {
    expect(() => custom.checkDateFieldMonth(ErrorMessages.MONTH, ErrorMessages.MONTH_AND_YEAR, "1", "001", "2023"))
      .toThrowError(ErrorMessages.MONTH_LENGTH);
  });

  test('should throw error if birth day field is greater than 2 digits', () => {
    expect(() => custom.checkDateFieldDayOfBirth("001", "1", "2023")).toThrowError(ErrorMessages.DATE_OF_BIRTH_DAY_LENGTH);
  });

  test('should throw error if birth month field is greater than 2 digits', () => {
    expect(() => custom.checkDateFieldMonthOfBirth(
      ErrorMessages.MONTH_OF_BIRTH, ErrorMessages.MONTH_LENGTH, ErrorMessages.MONTH_AND_YEAR_OF_BIRTH, "1", "001", "2023"))
      .toThrowError(ErrorMessages.MONTH_LENGTH);
  });

  test('should throw error if optional day field is greater than 2 digits', () => {
    expect(() => custom.checkDateFieldDayForOptionalDates("001", "1", "2023")).toThrowError(ErrorMessages.DAY_LENGTH);
  });

});

describe('tests for custom Date fields', () => {
  const today = DateTime.local();
  const tomorrow = today.plus({ days: 1 });
  const threeMonthsBack = today.minus({ months: 3 });
  const threeMonthsBackPlusADay = threeMonthsBack.plus({ days: 1 });
  const errors = {
    lengthError: "Too long",
    sameError: "Every kingdom divided against itself will be laid waste, and a house divided against a house will fall."
  };

  test("should return true for checkIdentityDateFields three months ago", () => {
    expect(() => custom.checkIdentityDateFields(threeMonthsBackPlusADay.day.toString(), threeMonthsBackPlusADay.month.toString(), threeMonthsBackPlusADay.year.toString())).not.toThrowError();
  });

  test("should throw error for checkIdentityDateFields invalid date field is passed in", () => {
    expect(() => custom.checkIdentityDateFields('33', threeMonthsBackPlusADay.month.toString(), threeMonthsBackPlusADay.year.toString())).toThrowError(ErrorMessages.INVALID_DATE);
  });

  test("should throw error for checkIdentityDateFields for future date", () => {
    expect(() => custom.checkIdentityDateFields(tomorrow.day.toString(), tomorrow.month.toString(), tomorrow.year.toString())).toThrowError(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
  });

  test("should throw error for checkIdentityDateFields for date 3 months or more in the past", () => {
    expect(() => custom.checkIdentityDateFields(threeMonthsBack.day.toString(), threeMonthsBack.month.toString(), threeMonthsBack.year.toString())).toThrowError(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
  });

  test("should be undefined for checkIdentityDateFields with no parameters", () => {
    expect(custom.checkIdentityDateFields()).toBeUndefined();
  });

  test('should be undefined for checkAllDateFields default date values', () => {
    expect(custom.checkAllDateFields()).toBeUndefined();
  });

  test('should be false for checkAllDateFieldsArePresent default date values', () => {
    expect(custom.checkAllDateFieldsArePresent()).toBe(false);
  });

  test('should be true for checkMoreThanOneDateFieldIsNotMissing default date values', () => {
    expect(custom.checkMoreThanOneDateFieldIsNotMissing()).toBe(true);
  });

  test('should be true for checkCeasedDateOnOrAfterStartDate default date values', () => {
    expect(custom.checkCeasedDateOnOrAfterStartDate()).toBe(true);
  });

  test('should be false for checkDateOfBirthFieldsArePresent default date values', () => {
    expect(custom.checkDateOfBirthFieldsArePresent()).toBe(false);
  });

  test('should throw error for checkDateFieldsForErrors default date values', () => {
    expect(() => custom.checkDateFieldsForErrors({})).toThrowError(ErrorMessages.ENTER_DATE);
  });

  test('should throw an error for checkOverseasName default name value', () => {
    expect(() => custom.checkOverseasName()).toThrowError(ErrorMessages.ENTITY_NAME);
  });

  test('should throw error for checkSecondNationality nationality and secon nationality longer than 50 characters', () => {
    expect(() => custom.checkSecondNationality("The amazing republic of Zamunda", "Another amazing republic of Zamunda", { lengthError: errors.lengthError })).toThrowError( errors.lengthError);
  });

  test('should throw error for checkSecondNationality when nationality same as second nationality', () => {
    expect(() => custom.checkSecondNationality("Zamunda", "Zamunda", { sameError: errors.sameError })).toThrowError(errors.sameError);
  });

  test("should return truthy value for checkPublicRegisterJurisdictionLength when register field not selected", () => {
    expect(() => custom.checkPublicRegisterJurisdictionLength(false, public_register_name, public_register_jurisdiction)).toBeTruthy();
  });

  test("should throw error for checkPublicRegisterJurisdictionLength when register field is selected", () => {
    expect(() => custom.checkPublicRegisterJurisdictionLength(true, public_register_name, public_register_jurisdiction))
      .toThrowError(ErrorMessages.MAX_ENTITY_PUBLIC_REGISTER_NAME_AND_JURISDICTION_LENGTH);
  });
});

describe('tests for checkDatePreviousToFilingDate ', () => {

  let mockAppData = {};
  let mockReq = {} as Request;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAppData = {
      update: {
        "filing_date": {
          "day": "16",
          "month": "6",
          "year": "2023"
        }
      }
    };

    mockReq = {
      session: {} as Session,
      headers: {},
      route: '',
      method: '',
      body: {},
    } as Request;
  });

  test("should return error if startDate is after filingDate", () => {
    (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

    expect(() => custom.checkDatePreviousToFilingDate(mockReq, "15", "6", "2023", ErrorMessages.START_DATE_BEFORE_FILING_DATE))
      .toBeTruthy();
  });

  test("should return error if startDate is after filingDate", () => {
    (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

    expect(() => custom.checkDatePreviousToFilingDate(mockReq, "3", "8", "2023", ErrorMessages.START_DATE_BEFORE_FILING_DATE))
      .toThrowError(ErrorMessages.START_DATE_BEFORE_FILING_DATE);
  });
});
