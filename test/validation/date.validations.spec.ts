import { RoleWithinTrustType } from '../../src/model/role.within.trust.type.model';
import { checkBirthDate, checkDateInterestedPerson, checkHistoricalBOEndDate, checkHistoricalBOStartDate, checkMoreThanOneDateOfBirthFieldIsNotMissing, checkStartDate,
  checkTrustDate } from '../../src/validation/custom.validation';
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
      },
      dayInputName: fieldNames[0],
      monthInputName: fieldNames[1],
      yearInputName: fieldNames[2],
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
      },
      dayInputName: fieldNames[0],
      monthInputName: fieldNames[1],
      yearInputName: fieldNames[2],
      condition: {
        elementName: "type",
        expectedValue: RoleWithinTrustType.INTERESTED_PERSON
      }
    };

    const sut = conditionalDateValidations(mockDateValidationsContext);
    expect(sut.length).toEqual(1);
    expect(mockIf).toBeCalledTimes(1);
    expect(mockCustom).toBeCalledTimes(1);
    expect(mockEquals).toBeCalledTimes(1);
  });
});

describe("test date method", () => {

  const errMsgCheckDateInterestedPerson: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_INTERESTED_PERSON,
    ErrorMessages.MONTH_AND_YEAR,
    ErrorMessages.DAY_AND_YEAR,
    ErrorMessages.DAY_AND_MONTH,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.YEAR_LENGTH,
    ErrorMessages.INVALID_DATE,
    ErrorMessages.DATE_NOT_IN_THE_PAST_INTERESTED_PERSON,
    ErrorMessages.YEAR,
    ErrorMessages.DAY,
    ErrorMessages.MONTH
  ];

  const errMsgcheckBirthDate: ErrorMessages[] = [
    ErrorMessages.ENTER_DATE_OF_BIRTH_INDIVIDUAL_BO,
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

  const errMsgHistoricalBOStartDate: ErrorMessages[] = [
    ErrorMessages.ENTER_START_DATE_HISTORICAL_BO,
    ErrorMessages.START_MONTH_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.START_DAY_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.START_DAY_AND_MONTH_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.START_YEAR_LENGTH_HISTORICAL_BO,
    ErrorMessages.INVALID_START_DATE_HISTORICAL_BO,
    ErrorMessages.START_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO,
    ErrorMessages.START_YEAR_HISTORICAL_BO,
    ErrorMessages.START_DAY_HISTORICAL_BO,
    ErrorMessages.START_MONTH_HISTORICAL_BO
  ];

  const errMsgHistoricalBOEndDate: ErrorMessages[] = [
    ErrorMessages.ENTER_END_DATE_HISTORICAL_BO,
    ErrorMessages.END_MONTH_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.END_DAY_AND_YEAR_HISTORICAL_BO,
    ErrorMessages.END_DAY_AND_MONTH_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.END_YEAR_LENGTH_HISTORICAL_BO,
    ErrorMessages.INVALID_END_DATE_HISTORICAL_BO,
    ErrorMessages.END_DATE_NOT_IN_PAST_OR_TODAY_HISTORICAL_BO,
    ErrorMessages.END_YEAR_HISTORICAL_BO,
    ErrorMessages.END_DAY_HISTORICAL_BO,
    ErrorMessages.END_MONTH_HISTORICAL_BO
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

  test.each(testDateCheck(errMsgCheckDateInterestedPerson))("should throw appropriate date errors for checkDate", (_day, _month, _year, _err) => {
    expect(() => checkDateInterestedPerson(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgcheckBirthDate))("should throw appropriate date errors for checkBirthDate", (_day, _month, _year, _err) => {
    expect(() => checkBirthDate(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgcheckTrustDate))("should throw appropriate date errors for checkTrustDate", (_day, _month, _year, _err) => {
    expect(() => checkTrustDate(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgHistoricalBOStartDate))("should throw appropriate date errors for checkHistoricalBOStartDate", (_day, _month, _year, _err) => {
    expect(() => checkHistoricalBOStartDate(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgHistoricalBOStartDate))("should throw appropriate date errors for checkHistoricalBOStartDate", (_day, _month, _year, _err) => {
    expect(() => checkHistoricalBOStartDate(_day, _month, _year)).toThrow(_err);
  });

  test.each(testDateCheck(errMsgHistoricalBOEndDate))("should throw appropriate date errors for checkHistoricalBOEndDate", (_day, _month, _year, _err) => {
    expect(() => checkHistoricalBOEndDate(_day, _month, _year)).toThrow(_err);
  });

  test.each([
    [["", "", "2020"], ErrorMessages.DAY_AND_MONTH_OF_BIRTH],
    [["02", "", ""], ErrorMessages.MONTH_AND_YEAR_OF_BIRTH],
    [["", "02", ""], ErrorMessages.DAY_AND_YEAR_OF_BIRTH]
  ])("test more than one date of birth field not missing", (date, err) => {
    expect (() => checkMoreThanOneDateOfBirthFieldIsNotMissing(...date)).toThrow(err);
  });
});
