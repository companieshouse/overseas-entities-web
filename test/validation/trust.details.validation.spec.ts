import { checkDateFieldDay, checkDateFieldMonth, checkDateFieldYear, checkStartDate } from '../../src/validation/custom.validation';
import { dateValidations, dateContext } from '../../src/validation/fields/helper/date.validation.helper';

const mockIsLength = jest.fn();
const mockIf = jest.fn();
const mockCustom = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    isLength: mockIsLength.mockReturnThis(),
    if: mockIf.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
  })),
}));

describe('Test to validate trust details page', () => {

  test('should test date validator tests correct fields', () => {
    const fieldNames = ["createdDateDay", "createdDateMonth", "createdDateYear", "createdDate"];
    const mockDateValidationsContext: dateContext = {
      dateInput: {
        name: fieldNames[3],
        callBack: checkStartDate
      },
      day: {
        name: fieldNames[0],
        callBack: checkDateFieldDay
      },
      month: {
        name: fieldNames[1],
        callBack: checkDateFieldMonth
      },
      year: {
        name: fieldNames[2],
        callBack: checkDateFieldYear
      }
    };

    const sut = dateValidations(mockDateValidationsContext, 4, 4);
    expect(sut.length).toEqual(4);
    expect(mockIsLength).toBeCalledTimes(2);
    expect(mockIf).toBeCalledTimes(2);
    expect(mockCustom).toBeCalledTimes(4);
  });
});
