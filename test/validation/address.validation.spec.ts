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

import { ErrorMessages } from "../../src/validation/error.messages";
import * as addressHelper from "../../src/validation/fields/address.validation";

describe('tests for addressFieldHasNoValue', () => {
  test('should throw error when radio button selection true', async () => {
    await expect(addressHelper.addressFieldHasNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], true, true)).rejects.toThrow(Error(ErrorMessages.ENTITY_CORRESPONDENCE_ADDRESS));
  });

  test('should return true when radio button selection is false', async () => {
    await expect((await addressHelper.addressFieldHasNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], false, true)).valueOf()).toBe(true);
  });

  test('should not throw error when throwsError false and all formData empty', async () => {
    await expect((await addressHelper.addressFieldHasNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], true, false)).valueOf()).toBe(true);
  });

  test('should return true for radioButton selection false', async () => {
    await expect((await addressHelper.addressFieldHasNoValue({ hero: "", nonHero: "" }, ["hero", "nonHero"], false)).valueOf()).toBe(true);
  });

  test('should return false when atLeast one formData field has value', async () => {
    await expect((await addressHelper.addressFieldHasNoValue({ hero: "Mario", nonHero: "" }, ["hero", "nonHero"], true, false)).valueOf()).toBe(false);
  });

  test('should return true when radio button selection false', async () => {
    await expect((await addressHelper.addressFieldHasNoValue({}, [], false, false)).valueOf()).toBe(true);
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
