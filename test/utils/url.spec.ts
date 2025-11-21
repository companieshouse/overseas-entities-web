import { expect, jest } from "@jest/globals";

jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/feature.flag");

import { Request, request } from "express";
import * as config from "../../src/config";
import * as urlUtils from "../../src/utils/url";
import { getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";
import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

describe("Url utils tests", () => {
  const req = request;
  const TRANSACTION_ID = "987654321";
  const SUBMISSION_ID = "1234-abcd";

  beforeEach(() => {
    jest.clearAllMocks();
    req["query"] = {};
    mockLoggerInfoRequest.mockReset();
  });

  describe("getUrlWithTransactionIdAndOverseasEntityId tests", () => {
    test("substitutes url params successfully", () => {
      const url = urlUtils.getUrlWithTransactionIdAndSubmissionId(config.PRESENTER_WITH_PARAMS_URL, TRANSACTION_ID, SUBMISSION_ID);
      expect(url).toEqual(`/register-an-overseas-entity/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/presenter`);
    });
  });

  describe("getUrlWithParamsToPath tests", () => {

    test("substitutes url params successfully by getting them from the request", () => {
      req["params"] = {
        [config.ROUTE_PARAM_TRANSACTION_ID]: TRANSACTION_ID,
        [config.ROUTE_PARAM_SUBMISSION_ID]: SUBMISSION_ID
      };

      const url = urlUtils.getUrlWithParamsToPath(config.PRESENTER_WITH_PARAMS_URL, req);
      expect(url).toEqual(`/register-an-overseas-entity/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/presenter`);
    });
  });

  describe("transactionIdAndSubmissionIdExistInRequest tests", () => {

    test("TRUE returned if both ids are set", () => {
      req["params"] = {
        [config.ROUTE_PARAM_TRANSACTION_ID]: TRANSACTION_ID,
        [config.ROUTE_PARAM_SUBMISSION_ID]: SUBMISSION_ID
      };

      const response = urlUtils.transactionIdAndSubmissionIdExistInRequest(req);
      expect(response).toEqual(true);
    });

    test("FALSE returned if neither id is set", () => {
      req["params"] = {
      };

      const response = urlUtils.transactionIdAndSubmissionIdExistInRequest(req);
      expect(response).toEqual(false);
    });

    test("FALSE returned if submission id not set", () => {
      req["params"] = {
        [config.ROUTE_PARAM_TRANSACTION_ID]: TRANSACTION_ID
      };

      const response = urlUtils.transactionIdAndSubmissionIdExistInRequest(req);
      expect(response).toEqual(false);
    });

    test("FALSE returned if transaction id not set", () => {
      req["params"] = {
        [config.ROUTE_PARAM_SUBMISSION_ID]: SUBMISSION_ID
      };

      const response = urlUtils.transactionIdAndSubmissionIdExistInRequest(req);
      expect(response).toEqual(false);
    });
  });

  describe("getTransactionIdAndSubmissionIdFromOriginalUrl tests", () => {

    const urlPathWithIds = "/transaction/123/submission/345";
    const urlPathWithoutIds = "/path/without/ids";
    const urlPathWithMissingTransactionId = "/trans/123/submission/345";
    const urlPathWithMissingSubmissionId = "/transaction/123/sub/345";
    const urlPathWithWrongPairing = "/transaction/submission/123/345";

    test("returns object with both transactionId and submissionId if they are present in originalUrl", () => {

      mockLoggerInfoRequest.mockReturnValueOnce(true);
      const request = {
        originalUrl: `${config.LANDING_URL}${urlPathWithIds}`,
      } as Request;

      const result: any = urlUtils.getTransactionIdAndSubmissionIdFromOriginalUrl(request);

      expect(result.transactionId).toBe("123");
      expect(result.submissionId).toBe("345");
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    });

    test("returns undefined if both transactionId and submissionId are missing in originalUrl", () => {

      mockLoggerInfoRequest.mockReturnValueOnce(true);
      const request = {
        originalUrl: `${config.LANDING_URL}${urlPathWithoutIds}`,
      } as Request;

      const result: any = urlUtils.getTransactionIdAndSubmissionIdFromOriginalUrl(request);

      expect(result).toBe(undefined);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    });

    test("returns undefined if only the transactionId is missing in originalUrl", () => {

      mockLoggerInfoRequest.mockReturnValueOnce(true);
      const request = {
        originalUrl: `${config.LANDING_URL}${urlPathWithMissingTransactionId}`,
      } as Request;

      const result: any = urlUtils.getTransactionIdAndSubmissionIdFromOriginalUrl(request);

      expect(result).toBe(undefined);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    });

    test("returns undefined if only the submissionId is missing in originalUrl", () => {

      mockLoggerInfoRequest.mockReturnValueOnce(true);
      const request = {
        originalUrl: `${config.LANDING_URL}${urlPathWithMissingSubmissionId}`,
      } as Request;

      const result: any = urlUtils.getTransactionIdAndSubmissionIdFromOriginalUrl(request);

      expect(result).toBe(undefined);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    });

    test("returns undefined if both transactionId and submissionId have not been paired separately", () => {

      mockLoggerInfoRequest.mockReturnValueOnce(true);
      const request = {
        originalUrl: `${config.LANDING_URL}${urlPathWithWrongPairing}`,
      } as Request;

      const result: any = urlUtils.getTransactionIdAndSubmissionIdFromOriginalUrl(request);

      expect(result).toBe(undefined);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    });

  });

  describe("isRegistrationJourney tests", () => {

    test("returns TRUE if we're currently in a registration flow", () => {

      const request = {
        originalUrl: `${config.LANDING_URL}/some/other/params`,
      } as Request;

      const result = urlUtils.isRegistrationJourney(request);
      expect(result).toBeTruthy();
    });

    test("returns FALSE if we're not currently in a registration flow", () => {
      const request = {
        originalUrl: `/path/does/not/start/with/${config.LANDING_URL}`,
      } as Request;

      const result = urlUtils.isRegistrationJourney(request);
      expect(result).toBeFalsy();
    });

  });

  describe("isUpdateJourney tests", () => {

    test("returns TRUE if we're currently in an update flow that is not a remove journey", () => {
      const request = {
        originalUrl: `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}/some/update/path`,
        query: {},
        session: {}
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(undefined);

      const result = urlUtils.isUpdateJourney(request);
      expect(result).toBeTruthy();
    });

    test("returns FALSE if we're currently in an update flow that is also a remove journey", () => {
      const request = {
        originalUrl: `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}/some/update/path`,
        session: {}
      } as Request;
      request["query"] = {
        journey: "remove"
      };

      const result = urlUtils.isRegistrationJourney(request);

      expect(result).toBeFalsy();
    });

    test("returns FALSE if we're not currently in an update flow", () => {
      const request = {
        originalUrl: `/path/does/not/start/with/${config.UPDATE_AN_OVERSEAS_ENTITY_URL}`,
      } as Request;

      const result = urlUtils.isRegistrationJourney(request);
      expect(result).toBeFalsy();
    });

  });

  describe("isRemoveJourney tests", () => {

    test("returns true if app data not present in session and query param journey=remove (singular journey param)", async () => {
      mockGetApplicationData.mockReturnValueOnce(undefined);

      req["query"] = {
        "journey": "remove"
      };

      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test.each([
      ['journey=remove&journey=remove', 'remove,remove'],
      ['journey=remove&journey=update', 'remove,update']
    ])("throws error if app data not present in session and journey query param %s (more than one journey param)", async (params, reqQueryValue) => {
      mockGetApplicationData.mockReturnValueOnce(undefined);
      mockCreateAndLogErrorRequest.mockReturnValue(new Error(`More than one journey query parameter found in url http://testurl?${params}`));

      req["query"] = {
        "journey": reqQueryValue
      };
      req.originalUrl = `http://testurl?${params}`;

      await expect(urlUtils.isRemoveJourney(req)).rejects.toThrow();
      expect(mockCreateAndLogErrorRequest.mock.calls[0][1]).toEqual(`More than one journey query parameter found in url ${req.originalUrl}`);
    });

    test("returns true if is_remove is undefined in session data and query param journey=remove", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      req["query"] = {
        "journey": "remove"
      };

      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is null in session data and query param journey=remove", async () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: null
        }
      );

      req["query"] = {
        "journey": "remove"
      };

      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is true in session data and query param journey=register", async () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: true
        }
      );

      req["query"] = {
        "journey": "register"
      };

      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is true in session data and query param journey not defined", async () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: true
        }
      );

      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns false if is_remove is false in session data and query param journey=remove", async () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: false
        }
      );

      req["query"] = {
        "journey": "remove"
      };

      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test.each([
      ["update"],
      ["removes"]
    ])("returns false if query param journey is a string other than remove - %s", async (journeyQueryParamValue) => {
      req["query"] = {
        "journey": journeyQueryParamValue
      };
      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is undefined", async () => {
      req["query"] = {
        "journey": undefined
      };
      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is not present", async () => {
      req["query"] = {
        "question": "answer"
      };
      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if request has empty query params object", async () => {
      req["query"] = {};
      const result = await urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });
  });

  describe("getPreviousPageUrl tests", () => {

    test("returns correct previous page from request headers", () => {
      req["rawHeaders"] = ["Referer", `http://host-name${config.WHO_IS_MAKING_FILING_URL}`];

      const previousPage = urlUtils.getPreviousPageUrl(req, config.REGISTER_AN_OVERSEAS_ENTITY_URL);

      // Check that the "http://host-name" absolute URL prefix has been stripped off when setting the previousPage URL
      expect(previousPage).toEqual(config.WHO_IS_MAKING_FILING_URL);
    });

    test("does not return a potentially malicious previous page URL", () => {
      req["rawHeaders"] = ["Referer", `http://host-name/illegal-path`];

      const previousPage = urlUtils.getPreviousPageUrl(req, config.REGISTER_AN_OVERSEAS_ENTITY_URL);

      // Check that the "http://host-name/illegal-path" url is not returned
      expect(previousPage).toBeUndefined();
    });

    test("returns undefined if no url found in headers", () => {
      req["rawHeaders"] = ["Referer", ""];

      const previousPage = urlUtils.getPreviousPageUrl(req, config.REGISTER_AN_OVERSEAS_ENTITY_URL);

      expect(previousPage).toBeUndefined();
    });
  });

  describe("getBackLinkUrl tests", () => {
    const urlWithEntityIds = "/transaction/:transactionId/submission/:submissionId/entity";
    const urlWithoutEntityIds = "/entity";
    const transactionId = "tx123";
    const submissionId = "sub456";
    const mockIsActiveFeature = isActiveFeature as jest.Mock;

    beforeEach(() => {
      jest.spyOn(urlUtils, "getTransactionIdAndSubmissionIdFromOriginalUrl").mockImplementation(() => ({
        transactionId,
        submissionId
      }));
      jest.spyOn(urlUtils, "getUrlWithTransactionIdAndSubmissionId").mockImplementation((url, tId, sId) => {
        return url.replace(":transactionId", tId).replace(":submissionId", sId);
      });
      jest.clearAllMocks();
    });

    test("returns url with entity ids when feature flag is enabled and ids are present", () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const req = { originalUrl: "/transaction/tx123/submission/sub456", params: {}, query: {} } as unknown as Request;
      const result = urlUtils.getBackLinkUrl({ req, urlWithEntityIds, urlWithoutEntityIds });
      expect(result).toBe("/transaction/tx123/submission/sub456/entity");
    });

    test("returns urlWithoutEntityIds when feature flag is disabled", () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const req = { originalUrl: "/transaction/tx123/submission/sub456", params: {}, query: {} } as unknown as Request;
      const result = urlUtils.getBackLinkUrl({ req, urlWithEntityIds, urlWithoutEntityIds });
      expect(result).toBe(urlWithoutEntityIds);
    });

    test("returns urlWithoutEntityIds when ids are undefined", () => {
      jest.spyOn(urlUtils, "getTransactionIdAndSubmissionIdFromOriginalUrl").mockReturnValue(undefined);
      const req = { originalUrl: "/no-ids-here", params: {}, query: {} } as unknown as Request;
      const result = urlUtils.getBackLinkUrl({ req, urlWithEntityIds, urlWithoutEntityIds });
      expect(result).toBe(urlWithoutEntityIds);
    });

    test("returns urlWithoutEntityIds and logs error if exception is thrown", () => {
      jest.spyOn(urlUtils, "getTransactionIdAndSubmissionIdFromOriginalUrl").mockImplementation(() => { throw new Error("fail"); });
      const req = { originalUrl: "/fail", params: {}, query: {} } as unknown as Request;
      const result = urlUtils.getBackLinkUrl({ req, urlWithEntityIds, urlWithoutEntityIds });
      expect(result).toBe(urlWithoutEntityIds);
      expect(logger.errorRequest).toHaveBeenCalled();
    });
  });
});
