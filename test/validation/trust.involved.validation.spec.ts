jest.mock("ioredis");

const expectResult = 'dummyValue';

const mockIsIn = jest.fn();
const mockWithMessage = jest.fn().mockReturnValue(expectResult);

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    isIn: mockIsIn.mockReturnThis(),
    withMessage: mockWithMessage,
  })),
}));

import { trustInvolved } from '../../src/validation/trust.involved.validation';
import { ErrorMessages } from '../../src/validation/error.messages';

describe('Test trustInvolved validator', () => {
  test('catch error when renders the page', () => {
    const actual = trustInvolved;

    expect(actual).toEqual([expectResult]);

    expect(mockIsIn).toBeCalledTimes(1);

    expect(mockWithMessage).toBeCalledTimes(1);
    expect(mockWithMessage).toBeCalledWith(ErrorMessages.TRUST_INVOLVED_INVALID);
  });
});
