jest.mock("ioredis");

const expectResult = 'dummyValue';

const mockNotEmpty = jest.fn();
const mockWithMessage = jest.fn().mockReturnValue(expectResult);

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    withMessage: mockWithMessage,
    notEmpty: mockNotEmpty.mockReturnThis(),
  })),
}));

import { addTrustValidations } from '../../src/validation/add.trust.validation';
import { ErrorMessages } from '../../src/validation/error.messages';

describe('Test addTrust validator', () => {
  test('catch error when renders the page', () => {

    expect(addTrustValidations).toEqual([expectResult]);

    expect(mockNotEmpty).toBeCalledTimes(1);

    expect(mockWithMessage).toBeCalledTimes(1);
    expect(mockWithMessage).toBeCalledWith(ErrorMessages.ADD_TRUST);
  });
});
