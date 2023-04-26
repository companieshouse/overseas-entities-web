import {
  checkCeasedDateOnOrAfterStartDate,
  checkFieldIfRadioButtonSelectedAndFieldsEmpty,
  checkPublicRegisterJurisdictionLength
} from "../../src/validation/custom.validation";
import { ErrorMessages } from "../../src/validation/error.messages";
import { MAX_80 } from "../__mocks__/max.length.mock";

const public_register_name = MAX_80 + "1";
const public_register_jurisdiction = MAX_80;

describe('checkCeasedDateOnOrAfterStartDate', () => {

  test('should throw error if ceased date before start date', () => {
    const ceaseDate = ["2", "2", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(() => checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toThrowError(ErrorMessages.CEASED_DATE_BEFORE_START_DATE);
  });

  test('should return true if ceased date after start date', () => {
    const ceaseDate = ["3", "3", "2023"];
    const startDate = ["2", "2", "2023"];

    expect(checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toBe(true);
  });

  test('should return true if ceased date = start date', () => {
    const ceaseDate = ["3", "3", "2023"];
    const startDate = ["3", "3", "2023"];

    expect(checkCeasedDateOnOrAfterStartDate(...ceaseDate, ...startDate)).toBe(true);
  });

  test("should test checkFieldIfRadioButtonSelectedAndFieldsEmpty validity", () => {
    const errorMsg = "kaput";
    expect(() => checkFieldIfRadioButtonSelectedAndFieldsEmpty(true, true, true, errorMsg)).toThrowError("Enter their correspondence address");
    expect(checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, true, true, errorMsg)).toBe(false);
    expect(() => checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, false, true, errorMsg)).toThrowError(errorMsg);
    expect(checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, false, false, errorMsg)).toBeFalsy();
  });

  test("should test checkPublicRegisterJurisdictionLength is not triggered when register field not selected", () => {
    expect(() => checkPublicRegisterJurisdictionLength(false, public_register_name, public_register_jurisdiction)).toBeTruthy();
  });

  test("should test checkPublicRegisterJurisdictionLength will trigger when register field is selected", () => {
    expect(() => checkPublicRegisterJurisdictionLength(true, public_register_name, public_register_jurisdiction))
      .toThrowError(ErrorMessages.MAX_ENTITY_PUBLIC_REGISTER_NAME_AND_JURISDICTION_LENGTH);
  });
});
