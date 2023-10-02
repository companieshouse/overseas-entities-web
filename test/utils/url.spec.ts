import { request } from "express";
import * as config from "../../src/config";
import * as urlUtils from "../../src/utils/url";

describe("Url utils tests", () => {
  const req = request;
  const TRANSACTION_ID = "987654321";
  const SUBMISSION_ID = "1234-abcd";

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
});
