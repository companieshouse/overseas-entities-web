import { setBeneficialOwnerData as setIndividualBeneficialOwnerData } from "../../../src/utils/beneficial.owner.individual";
import { setBeneficialOwnerData as setGovBeneficialOwnerData } from "../../../src/utils/beneficial.owner.gov";
import { setBeneficialOwnerData as setOtherBeneficialOwnerData } from "../../../src/utils/beneficial.owner.other";
import { prepareData, mapFieldsToDataObject } from "../../../src/utils/application.data";
import { CeasedDateKey } from "../../../src/model/date.model";

jest.mock("../../../src/utils/application.data");

const mockPrepareData = prepareData as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;

const mockDate = {
  year: "2023",
  month: "01",
  day: "02"
};

describe("Test storing BO ceased date in model", () => {

  test("Individual BO ceased date set when is still bo question answered no", () => {
    const reqBody = {
      "is_still_bo": '0'
    };

    testSetBeneficialOwnerData(reqBody, mockDate, setIndividualBeneficialOwnerData, 4);
  });

  test("Individual BO ceased date not set when is still bo question answered yes", () => {
    const reqBody = {
      "is_still_bo": '1'
    };

    testSetBeneficialOwnerData(reqBody, {}, setIndividualBeneficialOwnerData, 3);
  });

  test("Individual BO ceased date not set when is still bo question not in request data", () => {
    const reqBody = {
    };

    testSetBeneficialOwnerData(reqBody, {}, setIndividualBeneficialOwnerData, 3);
  });

  test("Gov BO ceased date set when is still bo question answered no", () => {
    const reqBody = {
      "is_still_bo": '0'
    };

    testSetBeneficialOwnerData(reqBody, mockDate, setGovBeneficialOwnerData, 3);
  });

  test("Gov BO ceased date not set when is still bo question answered yes", () => {

    const reqBody = {
      "is_still_bo": '1'
    };

    testSetBeneficialOwnerData(reqBody, {}, setGovBeneficialOwnerData, 2);
  });

  test("Gov BO ceased date not set when is still bo question not in request data", () => {

    const reqBody = {
    };

    testSetBeneficialOwnerData(reqBody, {}, setGovBeneficialOwnerData, 2);
  });

  test("Other BO ceased date set when is still bo question answered no", () => {

    const reqBody = {
      "is_still_bo": '0'
    };

    testSetBeneficialOwnerData(reqBody, mockDate, setOtherBeneficialOwnerData, 3);
  });

  test("Other BO ceased date not set when is still bo question answered yes", () => {

    const reqBody = {
      "is_still_bo": '1'
    };

    testSetBeneficialOwnerData(reqBody, {}, setOtherBeneficialOwnerData, 2);
  });

  test("Other BO ceased date not set when is still bo question not in request data", () => {

    const reqBody = {
    };

    testSetBeneficialOwnerData(reqBody, {}, setOtherBeneficialOwnerData, 2);
  });
});

function testSetBeneficialOwnerData(reqBody, expected, setBeneficialOwnerData, count) {
  mockPrepareData.mockReturnValueOnce({});
  for (let i = 0; i < count; i++) {
    mockMapFieldsToDataObject.mockReturnValueOnce({ test: i });
  }

  mockMapFieldsToDataObject.mockReturnValueOnce(
    mockDate
  );

  const appData = setBeneficialOwnerData(reqBody, "test123");
  expect(appData[CeasedDateKey]).toEqual(expected);
}
