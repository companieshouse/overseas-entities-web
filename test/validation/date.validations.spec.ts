import { RoleWithinTrustType } from '../../src/model/role.within.trust.type.model';
import { checkAllBirthDateFieldsPresent, checkAllDateFieldsPresent, checkBirthDate, checkDate, checkDateFieldDay, checkDateFieldMonth, checkDateFieldYear, checkStartDate } from '../../src/validation/custom.validation';
import { ErrorMessages } from '../../src/validation/error.messages';
import { dateValidations, dateContext, conditionalDateValidations, dateContextWithCondition } from '../../src/validation/fields/helper/date.validation.helper';

const mockIsLength = jest.fn();
const mockIf = jest.fn();
const mockCustom = jest.fn();
const mockEquals = jest.fn();
const mockWithMessage = jest.fn().mockReturnValue("Hello World");

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    isLength: mockIsLength.mockReturnThis(),
    if: mockIf.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
    equals: mockEquals.mockReturnThis(),
    withMessage: mockWithMessage,
  })),
}));

describe('Test to validate date validator', () => {

  beforeEach(() => {
    mockIsLength.mockRestore();
    mockIf.mockRestore();
    mockCustom.mockRestore();
    mockEquals.mockRestore();
    mockWithMessage.mockRestore();
  });

  test('should test dateValidations', () => {
    const fieldNames = ["createdDateDay", "createdDateMonth", "createdDateYear", "createdDate"];
    const mockDateValidationsContext: dateContext = {
      dateInput: {
        name: fieldNames[3],
        callBack: checkStartDate,
        errMsg: []
      },
      day: {
        name: fieldNames[0],
        callBack: checkDateFieldDay,
        errMsg: [ErrorMessages.DAY]
      },
      month: {
        name: fieldNames[1],
        callBack: checkDateFieldMonth,
        errMsg: [ErrorMessages.MONTH]
      },
      year: {
        name: fieldNames[2],
        callBack: checkDateFieldYear,
        errMsg: [ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH]
      }
    };

    const sut = dateValidations(mockDateValidationsContext, 4, 4);
    expect(sut.length).toEqual(4);
    expect(mockIsLength).toBeCalledTimes(4);
    expect(mockIf).toBeCalledTimes(2);
    expect(mockCustom).toBeCalledTimes(4);
    expect(mockWithMessage).toBeCalledTimes(2);
    expect(mockEquals).toBeCalledTimes(0);
  });

  test('should test conditionalDateValidations', () => {
    const fieldNames = ["createdDateDay", "createdDateMonth", "createdDateYear", "createdDate"];
    const mockDateValidationsContext: dateContextWithCondition = {
      dateInput: {
        name: fieldNames[3],
        callBack: checkStartDate,
        errMsg: [],
      },
      day: {
        name: fieldNames[0],
        callBack: checkDateFieldDay,
        errMsg: [ErrorMessages.DAY],
      },
      month: {
        name: fieldNames[1],
        callBack: checkDateFieldMonth,
        errMsg: [ErrorMessages.MONTH],
      },
      year: {
        name: fieldNames[2],
        callBack: checkDateFieldYear,
        errMsg: [ErrorMessages.YEAR, ErrorMessages.YEAR_LENGTH],
      },
      condition: { elementName: "type", expectedValue: RoleWithinTrustType.INTERESTED_PERSON }
    };

    const sut = conditionalDateValidations(mockDateValidationsContext, 4, 4);
    expect(sut.length).toEqual(4);
    expect(mockIsLength).toBeCalledTimes(4);
    expect(mockIf).toBeCalledTimes(6);
    expect(mockCustom).toBeCalledTimes(4);
    expect(mockWithMessage).toBeCalledTimes(2);
    expect(mockEquals).toBeCalledTimes(4);
  });
});

describe("test date method", () => {
  const today = new Date();
  const day = today.getDate().toString();
  const month = (today.getMonth() + 1).toString();
  const year = today.getFullYear().toString();
  test("should throw appropriate date errors for checkAllDateFieldsPresent", () => {
    expect(() => checkAllDateFieldsPresent("", "", "")).toThrow(ErrorMessages.ENTER_DATE);
    expect(() => checkAllDateFieldsPresent("02", "", "")).toThrow(ErrorMessages.MONTH_AND_YEAR);
    expect(() => checkAllDateFieldsPresent("", "02", "")).toThrow(ErrorMessages.DAY_AND_YEAR);
    expect(() => checkAllDateFieldsPresent("", "", "2009")).toThrow(ErrorMessages.DAY_AND_MONTH);
    expect(() => checkAllDateFieldsPresent("", "10", "2009")).toThrow(ErrorMessages.DAY);
    expect(() => checkAllDateFieldsPresent("10", "", "2009")).toThrow(ErrorMessages.MONTH);
  });
  test("should throw appropriate date errors for checkAllBirthDateFieldsPresent", () => {
    expect(() => checkAllBirthDateFieldsPresent("", "", "")).toThrow(ErrorMessages.ENTER_DATE_OF_BIRTH);
    expect(() => checkAllBirthDateFieldsPresent("02", "", "")).toThrow(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
    expect(() => checkAllBirthDateFieldsPresent("", "02", "")).toThrow(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
    expect(() => checkAllBirthDateFieldsPresent("", "", "2009")).toThrow(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
    expect(() => checkAllBirthDateFieldsPresent("", "10", "2009")).toThrow(ErrorMessages.DAY_OF_BIRTH);
    expect(() => checkAllBirthDateFieldsPresent("10", "", "2009")).toThrow(ErrorMessages.MONTH_OF_BIRTH);
  });
  test("should throw appropriate date errors for checkDate", () => {
    expect(() => checkDate("", "", "")).toThrow(ErrorMessages.ENTER_DATE);
    expect(() => checkDate("02", "", "")).toThrow(ErrorMessages.MONTH_AND_YEAR);
    expect(() => checkDate("", "02", "")).toThrow(ErrorMessages.DAY_AND_YEAR);
    expect(() => checkDate("", "", "2009")).toThrow(ErrorMessages.DAY_AND_MONTH);
    expect(() => checkDate("0", "10", "2009")).toThrow(ErrorMessages.INVALID_DATE);
    expect(() => checkDate("10", "0", "2009")).toThrow(ErrorMessages.INVALID_DATE);
    expect(() => checkDate("10", "10", "209")).toThrow(ErrorMessages.YEAR_LENGTH);
    expect(() => checkDate("10", "a", "2009")).toThrow(ErrorMessages.INVALID_DATE);
    expect(() => checkDate("10", "10", "9999")).toThrow(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(() => checkDate(day, month, year)).toThrow(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
  });
  test("should throw appropriate date errors for checkBirthDate", () => {
    expect(() => checkBirthDate("", "", "")).toThrow(ErrorMessages.ENTER_DATE_OF_BIRTH);
    expect(() => checkBirthDate("02", "", "")).toThrow(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
    expect(() => checkBirthDate("", "02", "")).toThrow(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
    expect(() => checkBirthDate("", "", "2009")).toThrow(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
    expect(() => checkBirthDate("0", "10", "2009")).toThrow(ErrorMessages.INVALID_DATE_OF_BIRTH);
    expect(() => checkBirthDate("10", "0", "2009")).toThrow(ErrorMessages.INVALID_DATE_OF_BIRTH);
    expect(() => checkBirthDate("10", "10", "209")).toThrow(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
    expect(() => checkBirthDate("10", "a", "2009")).toThrow(ErrorMessages.INVALID_DATE_OF_BIRTH);
    expect(() => checkBirthDate("10", "10", "9999")).toThrow(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    expect(() => checkBirthDate(day, month, year)).toThrow(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
  });
});
