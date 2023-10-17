jest.mock("../../src/utils/url");
jest.mock("../../src/utils/feature.flag");

import { Request } from "express";
import { addActiveSubmissionBasePathToTemplateData } from "../../src/utils/template.data";
import { getUrlWithParamsToPath } from "../../src/utils/url";
import { isActiveFeature } from "../../src/utils/feature.flag";

const dummyUrl = "DUMMY";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(dummyUrl);

describe("Template Data Utils tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addActiveSubmissionBasePathToTemplateData tests", () => {
    test("Adds activeSubmissionBasePath and Redis feature flag to template data - REDIS FLAG TRUE", () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const testObject = {
        name: "Bob",
        isOnRegister: false
      };
      const request = {} as Request;
      addActiveSubmissionBasePathToTemplateData(testObject, request);

      expect(testObject["FEATURE_FLAG_ENABLE_REDIS_REMOVAL"]).toEqual(true);
      expect(testObject["activeSubmissionBasePath"]).toEqual(dummyUrl);
    });

    test("Adds activeSubmissionBasePath and Redis feature flag to template data - REDIS FLAG FALSE", () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const testObject = {
        name: "Bob",
        isOnRegister: false
      };
      const request = {} as Request;
      addActiveSubmissionBasePathToTemplateData(testObject, request);

      expect(testObject["FEATURE_FLAG_ENABLE_REDIS_REMOVAL"]).toEqual(undefined);
      expect(testObject["activeSubmissionBasePath"]).toEqual(undefined);
    });
  });
});
