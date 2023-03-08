import { RoleWithinTrustType } from '../../src/model/role.within.trust.type.model';
import { checkAllBirthDateFieldsForErrors, checkDateFieldsForErrors, checkBirthDate,
  checkDate, checkDateFieldDay, checkDateFieldMonth, checkDateFieldYear, checkStartDate,
  checkTrustDateFieldsForErrors, checkTrustDate } from '../../src/validation/custom.validation';
import { ErrorMessages } from '../../src/validation/error.messages';
import { dateValidations, dateContext, conditionalDateValidations, dateContextWithCondition } from '../../src/validation/fields/helper/date.validation.helper';

const mockIf = jest.fn();
const mockCustom = jest.fn();
const mockEquals = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    if: mockIf.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
    equals: mockEquals.mockReturnThis(),
  })),
}));

describe('Test to validate date validator', () => {

  beforeEach(() => {
    mockIf.mockRestore();
    mockCustom.mockRestore();
    mockEquals.mockRestore();
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

    const sut = dateValidations(mockDateValidationsContext);
    expect(sut.length).toEqual(1);
    expect(mockIf).toBeCalledTimes(0);
    expect(mockCustom).toBeCalledTimes(1);
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

    const sut = conditionalDateValidations(mockDateValidationsContext);
    expect(sut.length).toEqual(1);
    expect(mockIf).toBeCalledTimes(1);
    expect(mockCustom).toBeCalledTimes(1);
    expect(mockEquals).toBeCalledTimes(1);
  });
});

describe("test date method", () => {
  const errMsgCheckAllDateFields: ErrorMessages[] = [ErrorMessages.ENTER_DATE,
    ErrorMessages.MONTH_AND_YEAR,
    ErrorMessages.DAY_AND_YEAR,
    ErrorMessages.DAY_AND_MONTH,
    ErrorMessages.DAY,
    ErrorMessages.MONTH,
    ErrorMessages.YEAR,
    ErrorMessages.DAY_LENGTH,
    ErrorMessages.MONTH_LENGTH];

  const errMsgcheckAllBirthDateFields: ErrorMessages[] = [ErrorMessages.ENTER_DATE_OF_BIRTH,
    ErrorMessages.MONTH_AND_YEAR_OF_BIRTH,
    ErrorMessages.DAY_AND_YEAR_OF_BIRTH,
    ErrorMessages.DAY_AND_MONTH_OF_BIRTH,
    ErrorMessages.DAY_OF_BIRTH,
    ErrorMessages.MONTH_OF_BIRTH,
    ErrorMessages.YEAR_OF_BIRTH,
    ErrorMessages.DAY_OF_BIRTH,
    ErrorMessages.MONTH_OF_BIRTH];

  const errMsgcheckTrustDateFields: ErrorMessages[] = [ErrorMessages.ENTER_DATE_OF_TRUST,
    ErrorMessages.MONTH_AND_YEAR_OF_TRUST,
    ErrorMessages.DAY_AND_YEAR_OF_TRUST,
    ErrorMessages.DAY_AND_MONTH_OF_TRUST,
    ErrorMessages.DAY_OF_TRUST,
    ErrorMessages.MONTH_OF_TRUST,
    ErrorMessages.YEAR_OF_TRUST,
    ErrorMessages.DAY_OF_TRUST,
    ErrorMessages.MONTH_OF_TRUST];

  const testDateFieldCheck = (err: ErrorMessages[]) => [
    ["", "", "", err[0]],
    ["02", "", "", err[1]],
    ["", "02", "", err[2]],
    ["", "", "2009", err[3]],
    ["", "10", "2009", err[4]],
    ["10", "", "2009", err[5]],
    ["10", "10", "", err[6]],
    ["", "10", "9999", err[7]],
    ["10", "", "9999", err[8]],
  ];

  const errMsgcheckDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE,
    ErrorMessages.MONTH_AND_YEAR,
    ErrorMessages.DAY_AND_YEAR,
    ErrorMessages.DAY_AND_MONTH,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.YEAR_LENGTH,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY,
    ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY,
    ErrorMessages.YEAR,
    ErrorMessages.DAY_LENGTH,
    ErrorMessages.MONTH_LENGTH
  ];

  const errMsgcheckBirthDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_OF_BIRTH,
    ErrorMessages.MONTH_AND_YEAR_OF_BIRTH,
    ErrorMessages.DAY_AND_YEAR_OF_BIRTH,
    ErrorMessages.DAY_AND_MONTH_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH,
    ErrorMessages.INVALID_DATE_OF_BIRTH,
    ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST,
    ErrorMessages.YEAR_OF_BIRTH,
    ErrorMessages.DAY_OF_BIRTH,
    ErrorMessages.MONTH_OF_BIRTH
  ];

  const errMsgcheckTrustDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_OF_TRUST,
    ErrorMessages.MONTH_AND_YEAR_OF_TRUST,
    ErrorMessages.DAY_AND_YEAR_OF_TRUST,
    ErrorMessages.DAY_AND_MONTH_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.YEAR_LENGTH_OF_TRUST,
    ErrorMessages.INVALID_DATE_OF_TRUST,
    ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_TRUST,
    ErrorMessages.YEAR_OF_TRUST,
    ErrorMessages.DAY_OF_TRUST,
    ErrorMessages.MONTH_OF_TRUST
  ];

  const testDateCheck = (err: ErrorMessages[]) => [
    ["", "", "", err[0]],
    ["02", "", "", err[1]],
    ["", "02", "", err[2]],
    ["", "", "2009", err[3]],
    ["0", "10", "2009", err[4]],
    ["10", "0", "2009", err[5]],
    ["10", "10", "209", err[6]],
    ["10", "a", "2009", err[7]],
    ["10", "10", "9999", err[8]],
    ["10", "10", "", err[9]],
    ["", "10", "9999", err[10]],
    ["10", "", "9999", err[11]],
  ];

  test.each(testDateFieldCheck(errMsgCheckAllDateFields))("should throw appropriate date errors for checkDateFieldsForErrors", ( _day, _month, _year, _err ) => {
    expect(() => checkDateFieldsForErrors(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateFieldCheck(errMsgcheckAllBirthDateFields))("should throw appropriate date errors for checkAllBirthDateFieldsForErrors", (_day, _month, _year, _err ) => {
    expect(() => checkAllBirthDateFieldsForErrors(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateFieldCheck(errMsgcheckTrustDateFields))("should throw appropriate date errors for checkTrustDateFieldsForErrors", (_day, _month, _year, _err ) => {
    expect(() => checkTrustDateFieldsForErrors(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgcheckDate))("should throw appropriate date errors for checkDate", (_day, _month, _year, _err) => {
    expect(() => checkDate(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgcheckBirthDate))("should throw appropriate date errors for checkBirthDate", (_day, _month, _year, _err) => {
    expect(() => checkBirthDate(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgcheckTrustDate))("should throw appropriate date errors for checkTrustDate", (_day, _month, _year, _err) => {
    expect(() => checkTrustDate(_day, _month, _year)).toThrow(_err);
  });
});
