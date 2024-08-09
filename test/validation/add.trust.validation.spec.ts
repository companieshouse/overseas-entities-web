jest.mock("ioredis");

const expectResult = 'dummyValue';

const mockIf = jest.fn().mockReturnThis();
const mockNotEmpty = jest.fn().mockReturnThis();
const mockWithMessage = jest.fn().mockReturnValue(expectResult);

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    if: mockIf,
    notEmpty: mockNotEmpty,
    withMessage: mockWithMessage
  })),
}));

import { addTrustValidations } from '../../src/validation/add.trust.validation';
import { ErrorMessages } from '../../src/validation/error.messages';

describe('Test addTrust validator', () => {
  test('catch error when renders the page', () => {

    expect(addTrustValidations).toEqual([expectResult]);
    expect(mockIf).toBeCalledTimes(1);
    expect(mockNotEmpty).toBeCalledTimes(1);

    expect(mockWithMessage).toBeCalledTimes(1);
    expect(mockWithMessage).toBeCalledWith(ErrorMessages.ADD_TRUST);
  });
});
