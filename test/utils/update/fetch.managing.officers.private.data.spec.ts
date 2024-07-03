import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { fetchManagingOfficersPrivateData } from "../../../src/utils/update/fetch.managing.officers.private.data";
import { getManagingOfficersPrivateData } from "../../../src/service/private.overseas.entity.details";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { logger } from "../../../src/utils/logger";
import { ApplicationData } from "../../../src/model";
import { MOCK_MANAGING_OFFICERS_PRIVATE_DATA, MOCK_APP_DATA_MOS } from "../../__mocks__/session.mock";

jest.mock("../../../src/utils/feature.flag");
jest.mock("../../../src/service/private.overseas.entity.details");
jest.mock("../../../src/utils/logger");

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetManagingOfficersPrivateData = getManagingOfficersPrivateData as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("fetchManagingOfficersPrivateData", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    appData = JSON.parse(JSON.stringify(MOCK_APP_DATA_MOS));
    jest.clearAllMocks();
  });

  test("should map Individual Managing Officers Private Data when data is available", async () => {
    mockIsActiveFeature.mockReturnValue(false);
    mockGetManagingOfficersPrivateData.mockResolvedValue(MOCK_MANAGING_OFFICERS_PRIVATE_DATA);

    await fetchManagingOfficersPrivateData(appData, req);

    expect(appData.update?.review_managing_officers_individual?.length).toEqual(2);

    const usual_residential_address = appData.update?.review_managing_officers_individual?.[0].usual_residential_address;
    const dob = appData.update?.review_managing_officers_individual?.[0].date_of_birth;
    expect(usual_residential_address?.property_name_number).toEqual("private_premises");
    expect(usual_residential_address?.line_1).toEqual("private_addressLine1");
    expect(usual_residential_address?.line_2).toEqual("private_addressLine2");
    expect(usual_residential_address?.town).toEqual("private_locality");
    expect(usual_residential_address?.county).toEqual("private_region");
    expect(usual_residential_address?.country).toEqual("private_country");
    expect(usual_residential_address?.postcode).toEqual("private_postalCode");
    expect(dob).toEqual({ day: '1', month: '1', year: '1990' });
  });

  test("should map Corporate Managing Officer data when data is available", async () => {
    mockIsActiveFeature.mockReturnValue(false);
    mockGetManagingOfficersPrivateData.mockResolvedValue(MOCK_MANAGING_OFFICERS_PRIVATE_DATA);

    await fetchManagingOfficersPrivateData(appData, req);

    expect(appData.update?.review_managing_officers_corporate?.length).toBeGreaterThan(0);

    const principal_address = appData.update?.review_managing_officers_corporate?.[0].principal_address;
    const email_address = appData.update?.review_managing_officers_corporate?.[0].contact_email;

    expect(principal_address?.property_name_number).toEqual("M02 premises");
    expect(principal_address?.line_1).toEqual("M02 principalAddress Ln1");
    expect(principal_address?.line_2).toEqual("private_addressLine2");
    expect(principal_address?.town).toEqual("private_locality");
    expect(principal_address?.county).toEqual("private_region");
    expect(principal_address?.country).toEqual("private_country");
    expect(principal_address?.postcode).toEqual("private_postalCode");
    expect(email_address).toEqual("jane.doe@example.com");
  });

  test("should handle absence of private Managing Officer details", async () => {
    mockIsActiveFeature.mockReturnValue(false);
    mockGetManagingOfficersPrivateData.mockResolvedValue([]);

    await fetchManagingOfficersPrivateData(appData, req);

    expect(mockLoggerInfo).toHaveBeenCalledWith(expect.stringContaining("No private Managing Officer details were retrieved"));
  });

  test("should handle error when fetching Managing Officer private data fails", async () => {
    mockIsActiveFeature.mockReturnValue(false);
    mockGetManagingOfficersPrivateData.mockRejectedValue(new Error("some error"));

    await fetchManagingOfficersPrivateData(appData, req);

    expect(mockLoggerError).toHaveBeenCalledWith(req, expect.stringContaining("Private Managing Officer details could not be retrieved"));
  });

  test("should not fetch MO private data if email address is present", async () => {
    appData = { entity: { email: "email@email.com" } };

    await fetchManagingOfficersPrivateData(appData, req);
    expect(mockGetManagingOfficersPrivateData).not.toHaveBeenCalled();
    expect(appData.update?.review_managing_officers_individual?.length).toBeUndefined();
    expect(appData.update?.review_managing_officers_corporate?.length).toBeUndefined();
  });

  test("should not fetch MO private data if overseasEntityId undefined", async () => {
    appData = { overseas_entity_id: undefined };

    await fetchManagingOfficersPrivateData(appData, req);
    expect(mockGetManagingOfficersPrivateData).not.toHaveBeenCalled();
    expect(appData.update?.review_managing_officers_individual?.length).toBeUndefined();
    expect(appData.update?.review_managing_officers_corporate?.length).toBeUndefined();
  });

  test("should not fetch MO private data if transactionId undefined", async () => {
    appData = { transaction_id: undefined };

    await fetchManagingOfficersPrivateData(appData, req);
    expect(mockGetManagingOfficersPrivateData).not.toHaveBeenCalled();
    expect(appData.update?.review_managing_officers_individual?.length).toBeUndefined();
    expect(appData.update?.review_managing_officers_corporate?.length).toBeUndefined();
  });
});
