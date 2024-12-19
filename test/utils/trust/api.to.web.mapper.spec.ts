jest.mock("../../../src/utils/trusts");
jest.mock("../../../src/utils/feature.flag");

import { mapTrustApiReturnModelToWebModel } from "../../../src/utils/trusts";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { mapTrustApiToWebWhenFlagsAreSet } from "../../../src/utils/trust/api.to.web.mapper";

const mockMapTrustApiReturnModelToWebModel = mapTrustApiReturnModelToWebModel as jest.Mock;
mockMapTrustApiReturnModelToWebModel.mockReturnValue(true);

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("mapTrustApiToWebWhenFlagsAreSet tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockMapTrustApiReturnModelToWebModel.mockReset();
  });

  test('is not invoked when isRegistration flag is false', () => {
    mapTrustApiToWebWhenFlagsAreSet(APPLICATION_DATA_MOCK, false);
    expect(mockMapTrustApiReturnModelToWebModel).not.toHaveBeenCalled();
  });

  test('is not invoked when REDIS_removal flag is set to OFF', () => {
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
    mapTrustApiToWebWhenFlagsAreSet(APPLICATION_DATA_MOCK as any, true);
    expect(mockMapTrustApiReturnModelToWebModel).not.toHaveBeenCalled();
  });

  test('is not invoked when Trusts_web flag is set to OFF', () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
    mapTrustApiToWebWhenFlagsAreSet(APPLICATION_DATA_MOCK as any, true);
    expect(mockMapTrustApiReturnModelToWebModel).not.toHaveBeenCalled();
  });

  test('is not invoked when REDIS_removal flag is set to OFF and Trusts_web flag is set to OFF', () => {
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
    mapTrustApiToWebWhenFlagsAreSet(APPLICATION_DATA_MOCK as any, true);
    expect(mockMapTrustApiReturnModelToWebModel).not.toHaveBeenCalled();
  });

  test('is invoked when isRegistration is set to TRUE and both flags are set to ON', () => {
    mockIsActiveFeature.mockReturnValue(true); // ALL_FLAGS
    mapTrustApiToWebWhenFlagsAreSet(APPLICATION_DATA_MOCK as any, true);
    expect(mockMapTrustApiReturnModelToWebModel).toHaveBeenCalledTimes(1);
  });
});
