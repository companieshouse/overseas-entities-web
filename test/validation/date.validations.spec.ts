import { RoleWithinTrustType } from '../../src/model/role.within.trust.type.model';
import { checkDateFieldDay, checkDateFieldMonth, checkDateFieldYear, checkStartDate } from '../../src/validation/custom.validation';
import { ErrorMessages } from '../../src/validation/error.messages';
import { dateValidations, dateContext, conditionalDateValidations, dateContextWithCondition } from '../../src/validation/fields/helper/date.validation.helper';

const mockIsLength = jest.fn();
const mockIf = jest.fn();
const mockCustom = jest.fn();
const mockEquals = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    isLength: mockIsLength.mockReturnThis(),
    if: mockIf.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
    equals: mockEquals.mockReturnThis(),
  })),
}));

describe('Test to validate date validator', () => {

  beforeEach(() => {
    mockIsLength.mockRestore();
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

    const sut = dateValidations(mockDateValidationsContext, 4, 4);
    expect(sut.length).toEqual(4);
    expect(mockIsLength).toBeCalledTimes(2);
    expect(mockIf).toBeCalledTimes(2);
    expect(mockCustom).toBeCalledTimes(4);
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
    expect(mockIsLength).toBeCalledTimes(2);
    expect(mockIf).toBeCalledTimes(6);
    expect(mockCustom).toBeCalledTimes(4);
  });
});
