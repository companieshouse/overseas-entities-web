const mockIf = jest.fn();
const mockCustom = jest.fn();
const mockNot = jest.fn();
const mockWithMessage = jest.fn();
const mockIsLength = jest.fn();
const mockMatches = jest.fn();
const mockIsEmpty = jest.fn();
const mockNotEmpty = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    if: mockIf.mockReturnThis(),
    custom: mockCustom.mockReturnThis(),
    not: mockNot.mockReturnThis(),
    matches: mockMatches.mockReturnThis(),
    isLength: mockIsLength.mockReturnThis(),
    withMessage: mockWithMessage.mockReturnThis(),
    isEmpty: mockIsEmpty.mockReturnThis(),
    notEmpty: mockNotEmpty.mockReturnThis(),
  })),
  check: jest.fn().mockImplementation(() => ({
    custom: mockCustom.mockReturnThis()
  })),
}));

import { addressFieldHasNoValue } from "../../src/validation/custom.validation";
import * as addressHelper from "../../src/validation/fields/address.validation";

describe('tests for addressFieldHasNoValue', () => {
  test('should return true when radio button selection true and all fields empty', async () => {
    await expect(addressFieldHasNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], true)).resolves.toBe(true);
  });

  test('should return true when radio button selection is false', async () => {
    await expect((await addressFieldHasNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], false)).valueOf()).toBe(true);
  });

  test('should return false when atLeast one formData field has value', async () => {
    await expect((await addressFieldHasNoValue({ hero: "Mario", nonHero: "" }, ["hero", "nonHero"], true)).valueOf()).toBe(false);
  });

  test('should return true when radio button selection false', async () => {
    await expect((await addressFieldHasNoValue({}, [], false)).valueOf()).toBe(true);
  });
});

describe('Legal entity usual residential service address validations test', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  test('should validate fields successfully', () => {
    addressHelper.legal_entity_usual_residential_service_address_validations();

    expect(mockNotEmpty).toHaveBeenCalled();
    expect(mockCustom).toHaveBeenCalled();
    expect(mockWithMessage).toHaveBeenCalled();
    expect(mockIsLength).toHaveBeenCalled();
    expect(mockMatches).toHaveBeenCalled();
    expect(mockIf).toHaveBeenCalled();
    expect(mockNot).toHaveBeenCalled();
    expect(mockIsEmpty).toHaveBeenCalled();
  });
});
