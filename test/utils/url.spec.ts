import { request } from "express";
import * as config from "../../src/config";
import * as urlUtils from "../../src/utils/url";

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

  describe("urlContainsRemoveJourneyQueryParam tests", () => {
    test("returns true if query param journey=remove", () => {
      req["query"] = {
        "journey": "remove"
      };
      const result = urlUtils.urlContainsRemoveJourneyQueryParam(req);

      expect(result).toBeTruthy();
    });

    test("returns false if query param journey is a string other than remove", () => {
      req["query"] = {
        "journey": "update"
      };
      const result = urlUtils.urlContainsRemoveJourneyQueryParam(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is undefined", () => {
      req["query"] = {
        "journey": undefined
      };
      const result = urlUtils.urlContainsRemoveJourneyQueryParam(req);

      expect(result).toBeFalsy();
    });

    test("returns false if query param journey is not present", () => {
      req["query"] = {
        "question": "answer"
      };
      const result = urlUtils.urlContainsRemoveJourneyQueryParam(req);

      expect(result).toBeFalsy();
    });

    test("returns false if request has empty query params object", () => {
      req["query"] = {};
      const result = urlUtils.urlContainsRemoveJourneyQueryParam(req);

      expect(result).toBeFalsy();
    });
  });
});
