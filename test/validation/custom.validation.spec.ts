import { checkFieldIfRadioButtonSelectedAndFieldsEmpty } from "../../src/validation/custom.validation";

describe("tests for custom validation functions", () => {
  test("should test checkFieldIfRadioButtonSelectedAndFieldsEmpty validity", () => {
    const errorMsg = "kaput";
    expect(() => checkFieldIfRadioButtonSelectedAndFieldsEmpty(true, true, true, errorMsg)).toThrowError("Enter their correspondence address");
    expect(checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, true, true, errorMsg)).toBe(false);
    expect(() => checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, false, true, errorMsg)).toThrowError(errorMsg);
    expect(checkFieldIfRadioButtonSelectedAndFieldsEmpty(false, false, false, errorMsg)).toBeFalsy();
  });
});
