const mockNotEmpty = jest.fn();
const mockCustom = jest.fn();
const mockNot = jest.fn();
const mockWithMessage = jest.fn();
const mockIsLength = jest.fn();
const mockMatches = jest.fn();
const mockIf = jest.fn();
const mockEquals = jest.fn();
const mockIsEmpty = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    notEmpty: mockNotEmpty.mockReturnThis(),
    isLength: mockIsLength.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
    not: mockNot.mockReturnThis(),
    matches: mockMatches.mockReturnThis(),
    if: mockIf.mockReturnThis(),
    equals: mockEquals.mockReturnThis(),
    withMessage: mockWithMessage.mockReturnThis(),
    isEmpty: mockIsEmpty.mockReturnThis(),
  })),
  check: jest.fn().mockImplementation(() => ({
    notEmpty: mockNotEmpty.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
    if: mockIf.mockReturnThis()
  })),
}));

import { ErrorMessages } from '../../src/validation/error.messages';
import * as helper from '../../src/validation/trust.legal.entity.beneficial.owner.validation';

describe('test legal entity validator', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  test('catch errors when renders the page', () => {
    helper.trustLegalEntityBeneficialOwnerValidator;
    expect(mockNotEmpty).toBeCalledTimes(55);
    expect(mockCustom).toBeCalledTimes(71);
    expect(mockWithMessage).toBeCalledTimes(53);
    expect(mockIsLength).toBeCalledTimes(17);
    expect(mockMatches).toBeCalledTimes(18);
    expect(mockIf).toBeCalledTimes(58);
    expect(mockEquals).toBeCalledTimes(11);
    expect(mockNot).toBeCalledTimes(9);
    expect(mockIsEmpty).toBeCalledTimes(9);
  });

  test('checkIfLessThanTargetValue throws error', async () => {
    await expect(helper.checkIfLessThanTargetValue(1, 2, 2)).rejects.toThrow(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
  });
});
