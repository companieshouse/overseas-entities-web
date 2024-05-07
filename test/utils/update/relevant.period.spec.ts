jest.mock("../../../src/utils/logger");

import { InputDate } from "../../../src/model/data.types.model";
import { logger } from "../../../src/utils/logger";
import { getRegistrationDate } from "../../../src/utils/update/relevant.period";

const mockLoggerInfo = logger.info as jest.Mock;

describe("Relevant period utils tests", () => {

  let validateDate, spyValidateDate;
  beforeEach(() => {
    validateDate = require("../../../src/validation/custom.validation");
    spyValidateDate = jest.spyOn(validateDate, 'checkDateValueIsValid');
  });

  afterEach(() => {
    spyValidateDate.mockReset();
    spyValidateDate.mockRestore();
  });

  test("Update registration date when registration date exist and is less the 31 january 2023", () => {
    const dateOfCreation: InputDate = { day: "22", month: "7", year: "2022" };
    const result: InputDate = getRegistrationDate(dateOfCreation);

    expect(result).toEqual(dateOfCreation);
    expect(spyValidateDate).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(0);
  });

  test("Update registration date when registration date exist and is greater than 31 january 2023", () => {
    const date_of_creation: InputDate = { day: "22", month: "4", year: "2023" };
    const expected: InputDate = { day: "31", month: "01", year: "2023" };
    const result: InputDate = getRegistrationDate(date_of_creation);

    expect(result).toEqual(expected);
    expect(spyValidateDate).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(0);
  });

  test("Update registration date when registration date does not exist.", () => {
    const date_of_creation = {} as InputDate;
    const expected: InputDate = { day: "31", month: "01", year: "2023" };
    const result: InputDate = getRegistrationDate(date_of_creation);

    expect(result).toEqual(expected);
    expect(spyValidateDate).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(1);
  });
});
