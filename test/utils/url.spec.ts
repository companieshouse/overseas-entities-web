jest.mock('../../src/utils/application.data');

import { request } from "express";
import * as config from "../../src/config";
import * as urlUtils from "../../src/utils/url";
import { getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Url utils tests", () => {
  const req = request;
  const TRANSACTION_ID = "987654321";
  const SUBMISSION_ID = "1234-abcd";

  beforeEach(() => {
    req["query"] = {};
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

  describe("isRemoveJourney tests", () => {

    test("returns true if app data not present in session and query param journey=remove", () => {
      mockGetApplicationData.mockReturnValueOnce(undefined);

      req["query"] = {
        "journey": "remove"
      };

      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is undefined in session data and query param journey=remove", () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      req["query"] = {
        "journey": "remove"
      };

      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is null in session data and query param journey=remove", () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: null
        }
      );

      req["query"] = {
        "journey": "remove"
      };

      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is true in session data and query param journey=register", () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: true
        }
      );

      req["query"] = {
        "journey": "register"
      };

      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns true if is_remove is true in session data and query param journey not defined", () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: true
        }
      );

      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeTruthy();
    });

    test("returns false if is_remove is false in session data and query param journey=remove", () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK,
          is_remove: false
        }
      );

      req["query"] = {
        "journey": "remove"
      };

      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is a string other than remove", () => {
      req["query"] = {
        "journey": "update"
      };
      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is undefined", () => {
      req["query"] = {
        "journey": undefined
      };
      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is not present", () => {
      req["query"] = {
        "question": "answer"
      };
      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });

    test("returns false if request has empty query params object", () => {
      req["query"] = {};
      const result = urlUtils.isRemoveJourney(req);

      expect(result).toBeFalsy();
    });
  });

  describe("getQueryParamsMinusRemoveJourney tests", () => {
    test("returns query params", () => {
      req["originalUrl"] = "http://update-an-overseas-entity/somepage?index=2&previousPage=startpage";
      const result = urlUtils.getQueryParamsMinusRemoveJourney(req);

      expect(result).toEqual("index=2&previousPage=startpage");
    });

    test("removes all occurrences of journey=remove query param", () => {
      req["originalUrl"] = "http://update-an-overseas-entity/somepage?journey=remove&journey=remove&journey=remove&index=2&journey=remove&journey=remove&previousPage=startpage&journey=remove";
      const result = urlUtils.getQueryParamsMinusRemoveJourney(req);

      expect(result).toEqual("index=2&previousPage=startpage");
    });

    test("returns empty string if no query params", () => {
      req["originalUrl"] = "http://update-an-overseas-entity/somepage";
      const result = urlUtils.getQueryParamsMinusRemoveJourney(req);

      expect(result).toEqual("");
    });
  });
});
