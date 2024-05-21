const mockIf = jest.fn();
const mockCustom = jest.fn();
const mockEquals = jest.fn();
const mockNotEmpty = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    custom: mockCustom.mockReturnThis(),
    equals: mockEquals.mockReturnThis(),
    if: mockIf.mockReturnThis(),
    notEmpty: mockNotEmpty.mockReturnThis(),
  })),
}));
jest.mock('../../src/utils/application.data');
jest.mock('../../src/service/company.profile.service');
jest.mock("../../src/utils/logger");

import { DateTime } from 'luxon';
import { RoleWithinTrustType } from '../../src/model/role.within.trust.type.model';
import { checkBirthDate,
  checkDateIPIndividualBO,
  checkDateIPLegalEntityBO,
  checkDateIsInPast,
  checkDateIsInPastOrToday,
  checkDateIsNotCompletelyEmpty,
  checkDateIsWithinLast3Months,
  checkDateOfBirthFieldsArePresent,
  checkDateValueIsValid,
  checkDayFieldForErrors,
  checkHistoricalBOEndDate, checkHistoricalBOStartDate, checkIdentityDate, checkMonthFieldForErrors, checkMoreThanOneDateOfBirthFieldIsNotMissing, checkOptionalDateDetails, checkDate,
  checkTrustDate,
  checkYearFieldForErrors,
  isYearEitherMissingOrCorrectLength } from '../../src/validation/custom.validation';
import { ErrorMessages } from '../../src/validation/error.messages';
import { dateValidations, dateContext, conditionalDateValidations, dateContextWithCondition } from '../../src/validation/fields/helper/date.validation.helper';
import { getApplicationData } from '../../src/utils/application.data';
import { getConfirmationStatementNextMadeUpToDateAsIsoString } from "../../src/service/company.profile.service";
import { Request, Response } from 'express';
import { NEXT_MADE_UP_TO_ISO_DATE, addNextMadeUpToDateToRequest } from "../../src/validation/fields/date.validation";
import { logger } from '../../src/utils/logger';

let mockReq = {} as Request;
const mockRes = {} as Response;
const mockNext = jest.fn();

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetConfirmationStatementNextMadeUpToDateAsIsoString = getConfirmationStatementNextMadeUpToDateAsIsoString as jest.Mock;
const mockErrorLogger = logger.errorRequest as jest.Mock;

describe('Test to validate date validator', () => {

  beforeEach(() => {
    mockIf.mockRestore();
    mockCustom.mockRestore();
    mockEquals.mockRestore();
    mockNotEmpty.mockRestore();
  });

  test('should test dateValidations', () => {
    const fieldNames = ["createdDateDay", "createdDateMonth", "createdDateYear", "createdDate"];
    const mockDateValidationsContext: dateContext = {
      dateInput: {
        name: fieldNames[3],
        callBack: checkDate,
      },
      dayInput: {
        name: fieldNames[0],
        errors: {
          noDayError: ErrorMessages.DAY_OF_BIRTH,
          wrongDayLength: ErrorMessages.DATE_OF_BIRTH_DAY_LENGTH,
          noRealDay: ErrorMessages.INVALID_DAY,
        }
      },
      monthInput: {
        name: fieldNames[1],
        errors: {
          noMonthError: ErrorMessages.MONTH_OF_BIRTH,
          wrongMonthLength: ErrorMessages.DATE_OF_BIRTH_MONTH_LENGTH,
          noRealMonth: ErrorMessages.INVALID_MONTH,
        }
      },
      yearInput: {
        name: fieldNames[2],
        errors: {
          noYearError: ErrorMessages.YEAR_OF_BIRTH,
          wrongYearLength: ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH
        }
      },
    };

    const sut = dateValidations(mockDateValidationsContext);
    expect(sut.length).toEqual(4);
    expect(mockIf).toHaveBeenCalled();
    expect(mockCustom).toHaveBeenCalled();
    expect(mockEquals).not.toHaveBeenCalled();
  });

  test('should test conditionalDateValidations success', () => {
    const fieldNames = ["createdDateDay", "createdDateMonth", "createdDateYear", "createdDate"];
    const mockDateValidationsContext: dateContextWithCondition = {
      dateInput: {
        name: fieldNames[3],
        callBack: checkDate,
      },
      dayInput: {
        name: fieldNames[0],
        errors: {
          noDayError: ErrorMessages.DAY_OF_BIRTH,
          wrongDayLength: ErrorMessages.DATE_OF_BIRTH_DAY_LENGTH,
          noRealDay: ErrorMessages.INVALID_DAY,
        }
      },
      monthInput: {
        name: fieldNames[1],
        errors: {
          noMonthError: ErrorMessages.MONTH_OF_BIRTH,
          wrongMonthLength: ErrorMessages.DATE_OF_BIRTH_MONTH_LENGTH,
          noRealMonth: ErrorMessages.INVALID_MONTH,
        }
      },
      yearInput: {
        name: fieldNames[2],
        errors: {
          noYearError: ErrorMessages.YEAR_OF_BIRTH,
          wrongYearLength: ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH
        }
      },
      condition: {
        elementName: RoleWithinTrustType.INTERESTED_PERSON,
        expectedValue: RoleWithinTrustType.INTERESTED_PERSON
      }
    };

    const sut = conditionalDateValidations(mockDateValidationsContext);
    expect(sut.length).toEqual(4);
    expect(mockIf).toBeCalledTimes(10);
    expect(mockCustom).toBeCalledTimes(4);
    expect(mockEquals).toBeCalledTimes(4);
  });

  test('should test conditionalDateValidations failure', () => {

    const fieldNames = ["createdDateDay", "createdDateMonth", "createdDateYear", "createdDate"];
    const mockDateValidationsContext: dateContextWithCondition = {
      dateInput: {
        name: fieldNames[3],
        callBack: checkDate,
      },
      dayInput: {
        name: fieldNames[0],
        errors: {
          noDayError: ErrorMessages.DAY_OF_BIRTH,
          wrongDayLength: ErrorMessages.DATE_OF_BIRTH_DAY_LENGTH,
          noRealDay: ErrorMessages.INVALID_DAY,
        }
      },
      monthInput: {
        name: fieldNames[1],
        errors: {
          noMonthError: ErrorMessages.MONTH_OF_BIRTH,
          wrongMonthLength: ErrorMessages.DATE_OF_BIRTH_MONTH_LENGTH,
          noRealMonth: ErrorMessages.INVALID_MONTH,
        }
      },
      yearInput: {
        name: fieldNames[2],
        errors: {
          noYearError: ErrorMessages.YEAR_OF_BIRTH,
          wrongYearLength: ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH
        }
      },
      condition: {
        elementName: RoleWithinTrustType.GRANTOR,
        expectedValue: RoleWithinTrustType.INTERESTED_PERSON
      }
    };

    const sut = conditionalDateValidations(mockDateValidationsContext);
    expect(sut.length).toEqual(4);
    expect(mockIf).toBeCalledTimes(10);
    expect(mockCustom).toBeCalledTimes(4);
    expect(mockEquals).toBeCalledTimes(4);
  });
});

describe("test date method", () => {

  const errMsgcheckDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_INTERESTED_PERSON_INDIVIDUAL_BO,
    ErrorMessages.MONTH_AND_YEAR,
    ErrorMessages.DAY_AND_YEAR,
    ErrorMessages.DAY_AND_MONTH,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
  ];

  const errMsgIPLegalEntityBO: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO,
    ErrorMessages.MONTH_AND_YEAR,
    ErrorMessages.DAY_AND_YEAR,
    ErrorMessages.DAY_AND_MONTH,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
  ];

  const errMsgcheckBirthDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO,
    ErrorMessages.MONTH_AND_YEAR_OF_BIRTH,
    ErrorMessages.DAY_AND_YEAR_OF_BIRTH,
    ErrorMessages.DAY_AND_MONTH_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
  ];

  const errMsgcheckTrustDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_OF_TRUST,
    ErrorMessages.MONTH_AND_YEAR_OF_TRUST,
    ErrorMessages.DAY_AND_YEAR_OF_TRUST,
    ErrorMessages.DAY_AND_MONTH_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
  ];

  const errMsgHistoricalBOStartDate: ErrorMessages[] = [
    ErrorMessages.ENTER_START_DATE_HISTORICAL_BO,
    ErrorMessages.START_MONTH_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.START_DAY_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.START_DAY_AND_MONTH_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.START_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
  ];

  const errMsgHistoricalBOEndDate: ErrorMessages[] = [
    ErrorMessages.ENTER_END_DATE_HISTORICAL_BO,
    ErrorMessages.END_MONTH_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.END_DAY_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.END_DAY_AND_MONTH_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.END_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
  ];

  const testDateCheck = (err: ErrorMessages[]) => [
    ["", "", "", err[0]],
    ["02", "", "", err[1]],
    ["", "02", "", err[2]],
    ["", "", "2009", err[3]],
    ["31", "09", "2009", err[4]],
    ["29", "02", "2009", err[5]],
    ["31", "11", "2009", err[6]],
    ["10", "10", "9999", err[7]],
    ["31", "02", "2009", err[8]],
    ["31", "06", "2009", err[9]],
    ["31", "04", "2008", err[10]],
  ];

  test.each(testDateCheck(errMsgcheckDate))("should throw appropriate date errors for checkDateIPIndividualBO", (_day, _month, _year, _err) => {
    expect(() => checkDateIPIndividualBO(_day, _month, _year)).toThrow(_err);
  });

  test("should throw no errors for checkDateIPIndividualBO", () => {
    expect(checkDateIPIndividualBO("1", "1", "2000")).toBe(true);
  });

  test("should throw errors for no arguments checkDateIPIndividualBO", () => {
    expect(() => checkDateIPIndividualBO()).toThrowError(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_INDIVIDUAL_BO);
  });

  test.each(testDateCheck(errMsgIPLegalEntityBO))("should throw appropriate date errors for checkDateIPLegalEntityBO", (_day, _month, _year, _err) => {
    expect(() => checkDateIPLegalEntityBO(_day, _month, _year)).toThrow(_err);
  });

  test("should throw no errors for checkDateIPLegalEntityBO", () => {
    expect(checkDateIPLegalEntityBO("1", "1", "2000")).toBe(true);
  });

  test("should throw errors for no arguments checkDateIPLegalEntityBO", () => {
    expect(() => checkDateIPLegalEntityBO()).toThrowError(ErrorMessages.ENTER_DATE_INTERESTED_PERSON_LEGAL_ENTITY_BO);
  });

  test.each(testDateCheck(errMsgcheckBirthDate))("should throw appropriate date errors for checkBirthDate", (_day, _month, _year, _err) => {
    expect(() => checkBirthDate(_day, _month, _year)).toThrow(_err);
  });

  test("should throw no errors for checkBirthDate", () => {
    expect(checkBirthDate("1", "1", "2000")).toBe(true);
  });

  test("should throw errors for no arguments checkBirthDate", () => {
    expect(() => checkBirthDate()).toThrowError(ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO);
  });

  test.each(testDateCheck(errMsgcheckTrustDate))("should throw appropriate date errors for checkTrustDate", (_day, _month, _year, _err) => {
    expect(() => checkTrustDate(_day, _month, _year)).toThrow(_err);
  });

  test("should throw no errors for checkTrustDate", () => {
    expect(checkTrustDate("1", "1", "2000")).toBe(true);
  });

  test("should throw errors for no arguments checkBirthDate", () => {
    expect(() => checkBirthDate()).toThrowError(ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO);
  });

  test.each(testDateCheck(errMsgHistoricalBOStartDate))("should throw appropriate date errors for checkHistoricalBOStartDate", (_day, _month, _year, _err) => {
    expect(() => checkHistoricalBOStartDate(_day, _month, _year)).toThrow(_err);
  });

  test("should throw no errors for checkHistoricalBOStartDate", () => {
    expect(checkHistoricalBOStartDate("1", "1", "2000")).toBe(true);
  });

  test("should throw errors for no arguments checkHistoricalBOStartDate", () => {
    expect(() => checkHistoricalBOStartDate()).toThrowError(ErrorMessages.ENTER_START_DATE_HISTORICAL_BO);
  });

  test.each(testDateCheck(errMsgHistoricalBOEndDate))("should throw appropriate date errors for checkHistoricalBOEndDate", (_day, _month, _year, _err) => {
    expect(() => checkHistoricalBOEndDate(_day, _month, _year)).toThrow(_err);
  });

  test("should throw no errors for checkHistoricalBOEndDate", () => {
    expect(checkHistoricalBOEndDate("1", "1", "2000")).toBe(true);
  });

  test("should throw errors for no arguments checkHistoricalBOEndDate", () => {
    expect(() => checkHistoricalBOEndDate()).toThrowError(ErrorMessages.ENTER_END_DATE_HISTORICAL_BO);
  });

  test.each([
    [["", "", "2020"], ErrorMessages.DAY_AND_MONTH_OF_BIRTH],
    [["02", "", ""], ErrorMessages.MONTH_AND_YEAR_OF_BIRTH],
    [["", "02", ""], ErrorMessages.DAY_AND_YEAR_OF_BIRTH]
  ])("test more than one date of birth field not missing", (date, err) => {
    expect (() => checkMoreThanOneDateOfBirthFieldIsNotMissing(...date)).toThrow(err);
  });

  test("test default arguments for checkMoreThanOneDateOfBirthFieldIsNotMissing", () => {
    expect (checkMoreThanOneDateOfBirthFieldIsNotMissing()).toBeUndefined();
  });
});

describe("test day,month and year error checkers", () => {
  const errors = {
    noDayError: ErrorMessages.DAY,
    noMonthError: ErrorMessages.MONTH,
    noYearError: ErrorMessages.YEAR,
    wrongDayLength: ErrorMessages.DAY_LENGTH,
    wrongMonthLength: ErrorMessages.MONTH_LENGTH,
    wrongYearLength: ErrorMessages.YEAR_LENGTH,
    noRealDay: ErrorMessages.INVALID_DAY,
    noRealMonth: ErrorMessages.INVALID_MONTH,
  };
  test("test day absent", () => {
    expect(() => checkDayFieldForErrors({
      noDayError: errors.noDayError,
      wrongDayLength: errors.wrongDayLength,
      noRealDay: errors.noRealDay,
    }, "")).toThrowError(errors.noDayError);

    expect(() => checkDayFieldForErrors({
      noDayError: errors.noDayError,
      wrongDayLength: errors.wrongDayLength,
      noRealDay: errors.noRealDay,
    }, "123")).toThrowError(errors.wrongDayLength);

    expect(() => checkDayFieldForErrors({
      noDayError: errors.noDayError,
      wrongDayLength: errors.wrongDayLength,
      noRealDay: errors.noRealDay, }, "13")).toBeTruthy();

    expect(checkDayFieldForErrors({
      noDayError: errors.noDayError,
      wrongDayLength: errors.wrongDayLength,
      noRealDay: errors.noRealDay, }, "3")).toBe(true);

    expect(() => checkDayFieldForErrors({
      noDayError: errors.noDayError,
      wrongDayLength: errors.wrongDayLength,
      noRealDay: errors.noRealDay, })).toThrow(errors.noDayError);
  });
  test("test month absent", () => {
    expect(() => checkMonthFieldForErrors({
      noMonthError: errors.noMonthError,
      wrongMonthLength: errors.wrongMonthLength,
      noRealMonth: errors.noRealMonth,
    }, "")).toThrowError(errors.noMonthError);

    expect(() => checkMonthFieldForErrors({
      noMonthError: errors.noMonthError,
      wrongMonthLength: errors.wrongMonthLength,
      noRealMonth: errors.noRealMonth, }, "321")).toThrowError(errors.wrongMonthLength);

    expect(() => checkMonthFieldForErrors({
      noMonthError: errors.noMonthError,
      wrongMonthLength: errors.wrongMonthLength,
      noRealMonth: errors.noRealMonth, }, "1")).toBeTruthy();

    expect(checkMonthFieldForErrors({
      noMonthError: errors.noMonthError,
      wrongMonthLength: errors.wrongMonthLength,
      noRealMonth: errors.noRealMonth, }, "12")).toBe(true);

    expect(() => checkMonthFieldForErrors({
      noMonthError: errors.noMonthError,
      wrongMonthLength: errors.wrongMonthLength,
      noRealMonth: errors.noRealMonth, })).toThrowError(errors.noMonthError);
  });
  test("test year absent", () => {
    expect(() => checkYearFieldForErrors({
      noYearError: errors.noYearError,
      wrongYearLength: errors.wrongYearLength }, "")).toThrowError(errors.noYearError);

    expect(() => checkYearFieldForErrors({
      noYearError: errors.noYearError,
      wrongYearLength: errors.wrongYearLength })).toThrowError(errors.noYearError);

    expect(() => checkYearFieldForErrors({
      noYearError: errors.noYearError,
      wrongYearLength: errors.wrongYearLength }, "20033")).toThrowError(errors.wrongYearLength);

    expect(() => checkYearFieldForErrors({
      noYearError: errors.noYearError,
      wrongYearLength: errors.wrongYearLength }, "200")).toThrowError(errors.wrongYearLength);

    expect(checkYearFieldForErrors({
      noYearError: errors.noYearError,
      wrongYearLength: errors.wrongYearLength }, "2033")).toBe(true);
  });
});

describe("should check date functions for custom validation", () => {
  const today = DateTime.local();
  const tomorrow = today.plus({ days: 1 });
  const yesterday = today.minus({ days: 1 });
  const threeMonthsBack = today.minus({ months: 3 });
  const threeMonthsBackPlus = threeMonthsBack.minus({ days: 1 });
  const errorMsg = "An Error coming your way soon";

  test.each([
    ["", "", ""],
  ])("should test checkDateIsNotCompletelyEmpty returns false", (_day, _month, _year) => {
    expect(checkDateIsNotCompletelyEmpty(_day, _month, _year)).toBe(false);
  });

  test.each([
    ["12", "", ""],
    ["", "12", ""],
    ["", "", "2000"],
    ["12", "12", ""],
    ["", "12", "2000"],
    ["12", "", "2000"],
  ])("should test checkDateIsNotCompletelyEmpty returns true", (_day, _month, _year) => {
    expect(checkDateIsNotCompletelyEmpty(_day, _month, _year)).toBe(true);
  });

  test("should test checkDateIsNotCompletelyEmpty no params returns false", () => {
    expect(checkDateIsNotCompletelyEmpty()).toBe(false);
  });

  test.each([
    [yesterday.day.toString(), yesterday.month.toString(), yesterday.year.toString()]
  ])("should test checkDateIsInPast returns true", (_day, _month, _year) => {
    expect(checkDateIsInPast("", _day, _month, _year)).toBe(true);
  });

  test.each([
    [tomorrow.day.toString(), tomorrow.month.toString(), tomorrow.year.toString()],
    [today.day.toString(), today.month.toString(), today.year.toString()]
  ])("should test checkDateIsInPast throws error", (_day, _month, _year) => {
    expect(() => checkDateIsInPast(errorMsg, _day, _month, _year)).toThrowError(errorMsg);
  });

  // TODO: empty strings should not be returning true
  test("should test checkDateIsInPast returns true for no param", () => {
    expect(checkDateIsInPast(errorMsg)).toBe(true);
  });

  test.each([
    [yesterday.day.toString(), yesterday.month.toString(), yesterday.year.toString()],
    [today.day.toString(), today.month.toString(), today.year.toString()]
  ])("should test checkDateIsInPastOrToday returns true", (_day, _month, _year) => {
    expect(checkDateIsInPastOrToday("", _day, _month, _year)).toBe(true);
  });

  test.each([
    [tomorrow.day.toString(), tomorrow.month.toString(), tomorrow.year.toString()]
  ])("should test checkDateIsInPastOrToday throws error", (_day, _month, _year) => {
    expect(() => checkDateIsInPastOrToday(errorMsg, _day, _month, _year)).toThrowError(errorMsg);
  });

  // TODO: empty strings should not be returning true
  test("should test checkDateIsInPastOrToday returns true for no param", () => {
    expect(checkDateIsInPastOrToday(errorMsg)).toBe(true);
  });

  test.each([
    [yesterday.day.toString(), yesterday.month.toString(), yesterday.year.toString()],
    [today.day.toString(), today.month.toString(), today.year.toString()],
    [tomorrow.day.toString(), tomorrow.month.toString(), tomorrow.year.toString()]
  ])("should test checkDateIsWithinLast3Months returns true", (_day, _month, _year) => {
    expect(checkDateIsWithinLast3Months("", _day, _month, _year)).toBe(true);
  });

  test.each([
    [threeMonthsBack.day.toString(), threeMonthsBack.month.toString(), threeMonthsBack.year.toString()],
    [threeMonthsBackPlus.day.toString(), threeMonthsBackPlus.month.toString(), threeMonthsBackPlus.year.toString()]
  ])("should test checkDateIsWithinLast3Months throws error", (_day, _month, _year) => {
    expect(() => checkDateIsWithinLast3Months(errorMsg, _day, _month, _year)).toThrowError(errorMsg);
  });

  // TODO: empty strings should not be returning true
  test("should test checkDateIsWithinLast3Months returns true for no param", () => {
    expect(checkDateIsWithinLast3Months(errorMsg)).toBe(true);
  });

  test.each([
    [yesterday.day.toString(), yesterday.month.toString(), yesterday.year.toString()],
    [today.day.toString(), today.month.toString(), today.year.toString()],
    [tomorrow.day.toString(), tomorrow.month.toString(), tomorrow.year.toString()],
    [threeMonthsBack.day.toString(), threeMonthsBack.month.toString(), threeMonthsBack.year.toString()],
    [threeMonthsBackPlus.day.toString(), threeMonthsBackPlus.month.toString(), threeMonthsBackPlus.year.toString()]
  ])("should test checkDateOfBirthFieldsArePresent returns true", (_day, _month, _year) => {
    expect(checkDateOfBirthFieldsArePresent(_day, _month, _year)).toBe(true);
  });

  test.each([
    ["", "", ""],
    ["", "12", ""],
    ["", "", "2000"],
    ["", "12", "2000"],
    ["12", "", ""],
    ["12", "12", ""],
  ])("should test checkDateOfBirthFieldsArePresent throws error or returns false", (_day, _month, _year) => {
    expect(checkDateOfBirthFieldsArePresent(_day, _month, _year)).toBeFalsy();
  });

  // These dates should cause checkDateValueIsValid to be true
  test.each([
    [yesterday.day.toString(), yesterday.month.toString(), yesterday.year.toString()],
    [today.day.toString(), today.month.toString(), today.year.toString()],
    [tomorrow.day.toString(), tomorrow.month.toString(), tomorrow.year.toString()],
    [threeMonthsBack.day.toString(), threeMonthsBack.month.toString(), threeMonthsBack.year.toString()],
    [threeMonthsBackPlus.day.toString(), threeMonthsBackPlus.month.toString(), threeMonthsBackPlus.year.toString()],
    ["01", "02", "2023"],
    ["1", "1", "2001"]
  ])("should test checkDateValueIsValid returns true %s %s %s", (_day, _month, _year) => {
    expect(checkDateValueIsValid("", _day, _month, _year)).toBe(true);
  });

  // These dates should cause checkDateValueIsValid to throw an error
  test.each([
    ["a", "b", "c"],
    ["12", "b", "2004"],
    ["a", "b", "c"],
    ["12", "32", "2004"],
    ["2004", "12", "2004"],
    ["0", "1", "2001"],
    ["1/1", "1", "2001"],
    ["+1", "1", "2001"],
    ["001", "1", "2001"],
    ["2", "003", "2004"],
    ["1", "-1", "1999"],
    ["1", "1", "0999"],
    ["00", "1", "2023"],
    ["01", "00", "2023"],
    ["011", "1", "2023"],
    ["1", "013", "2023"],
    ["1", "1.0", "1990"],
  ])(`should test checkDateValueIsValid throws error %s %s %s`, (day, month, year) => {
    expect(() => checkDateValueIsValid(errorMsg, day, month, year)).toThrowError(errorMsg);
  });

  test("should test checkDateValueIsValid throws error for no param", () => {
    expect(() => checkDateValueIsValid(errorMsg)).toThrow(errorMsg);
  });

  test("should test isYearEitherMissingOrCorrectLength returns true for no param", () => {
    expect(isYearEitherMissingOrCorrectLength()).toBe(true);
  });

  test("should test isYearEitherMissingOrCorrectLength returns true for 4 digit year param", () => {
    expect(isYearEitherMissingOrCorrectLength("2004")).toBe(true);
  });

  test("should test checkOptionalDateDetails returns false for no param", () => {
    expect(checkOptionalDateDetails()).toBe(false);
  });

  // TODO: Needs some rework
  test("should test checkIdentityDate returns true for no param", () => {
    expect(checkIdentityDate()).toBe(true);
  });
});

describe("addNextMadeUpToDateToRequest tests", () => {
  beforeEach(() => {
    mockReq = {} as Request;
    mockNext.mockClear();
    mockErrorLogger.mockClear();
    mockGetApplicationData.mockReset();
  });

  test("test addNextMadeUpToDateToRequest adds made up to date to request object", async () => {
    mockGetApplicationData.mockReturnValueOnce({
      entity_number: "123456"
    });
    mockGetConfirmationStatementNextMadeUpToDateAsIsoString.mockReturnValueOnce("2024-03-01");

    await addNextMadeUpToDateToRequest(mockReq, mockRes, mockNext);
    expect(mockReq[NEXT_MADE_UP_TO_ISO_DATE]).toEqual("2024-03-01");
  });

  test("test addNextMadeUpToDateToRequest sends error to next function when entity number missing", async () => {
    mockGetApplicationData.mockReturnValueOnce({ });
    await addNextMadeUpToDateToRequest(mockReq, mockRes, mockNext);
    expect(mockErrorLogger.mock.calls[0][1]).toContain("filing date validation - Unable to find entity number in application data.");
    expect(mockNext).toBeCalledWith(expect.objectContaining({ 'message': ErrorMessages.UNABLE_TO_RETRIEVE_ENTITY_NUMBER }));
  });

  test("test addNextMadeUpToDateToRequest sends error to next function when next made up to date is missing", async () => {
    mockGetApplicationData.mockReturnValueOnce({
      entity_number: "123456"
    });
    mockGetConfirmationStatementNextMadeUpToDateAsIsoString.mockReturnValueOnce(undefined);
    await addNextMadeUpToDateToRequest(mockReq, mockRes, mockNext);
    expect(mockErrorLogger.mock.calls[0][1]).toContain("filing date validation - Unable to find next made up to date for entity 123456");
    expect(mockNext).toBeCalledWith(expect.objectContaining({ 'message': ErrorMessages.UNABLE_TO_RETRIEVE_EXPECTED_DATE }));
  });
});
