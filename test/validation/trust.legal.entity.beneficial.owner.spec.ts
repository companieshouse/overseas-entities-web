const mockTrim = jest.fn();
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
    trim: mockTrim.mockReturnThis(),
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
    if: mockIf.mockReturnThis(),
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
    expect(mockNotEmpty).toHaveBeenCalled();
    expect(mockCustom).toHaveBeenCalled();
    expect(mockWithMessage).toHaveBeenCalled();
    expect(mockIsLength).toHaveBeenCalled();
    expect(mockMatches).toHaveBeenCalled();
    expect(mockIf).toHaveBeenCalled();
    expect(mockEquals).toHaveBeenCalled();
    expect(mockNot).toHaveBeenCalled();
    expect(mockIsEmpty).toHaveBeenCalled();
  });

  test('checkIfLessThanTargetValue throws error', async () => {
    await expect(() => helper.checkIfLessThanTargetValue(1, 2, 2)).rejects.toThrow(ErrorMessages.NAME_REGISTRATION_JURISDICTION_LEGAL_ENTITY_BO);
  });
});
