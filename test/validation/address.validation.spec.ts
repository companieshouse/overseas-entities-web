
const mockCustom = jest.fn();
const mockNot = jest.fn();
const mockWithMessage = jest.fn();
const mockIsLength = jest.fn();
const mockMatches = jest.fn();
const mockIsEmpty = jest.fn();

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    custom: mockCustom.mockReturnThis(),
    not: mockNot.mockReturnThis(),
    matches: mockMatches.mockReturnThis(),
    isLength: mockIsLength.mockReturnThis(),
    withMessage: mockWithMessage.mockReturnThis(),
    isEmpty: mockIsEmpty.mockReturnThis()
  })),
  check: jest.fn().mockImplementation(() => ({
    custom: mockCustom.mockReturnThis()
  })),
}));

import { addressFieldsHaveNoValue } from "../../src/validation/custom.validation";
import * as addressHelper from "../../src/validation/fields/address.validation";

describe('tests for addressFieldsHaveNoValue', () => {
  test('should return true when radio button selection true and all fields empty', async () => {
    await expect(addressFieldsHaveNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], true)).resolves.toBe(true);
  });

  test('should return false when radio button selection is false', async () => {
    await expect((await addressFieldsHaveNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], false)).valueOf()).toBe(false);
  });

  test('should return false when atLeast one formData field has value', async () => {
    await expect((await addressFieldsHaveNoValue({ hero: "Mario", nonHero: "" }, ["hero", "nonHero"], true)).valueOf()).toBe(false);
  });

  test('should return false when radio button selection false', async () => {
    await expect((await addressFieldsHaveNoValue({}, [], false)).valueOf()).toBe(false);
  });
});

describe('Legal entity usual residential service address validations test', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  test('should validate fields successfully', () => {
    addressHelper.legal_entity_usual_residential_service_address_validations();

    expect(mockCustom).toHaveBeenCalled();
    expect(mockWithMessage).toHaveBeenCalled();
    expect(mockIsLength).toHaveBeenCalled();
    expect(mockMatches).toHaveBeenCalled();
    expect(mockNot).toHaveBeenCalled();
    expect(mockIsEmpty).toHaveBeenCalled();
  });
});
