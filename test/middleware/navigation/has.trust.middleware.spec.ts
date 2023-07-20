jest.mock(".../../../src/utils/application.data");
jest.mock("ioredis");

import { Request, Response } from "express";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { hasTrustWithIdRegister, hasTrustDataRegister, hasTrustWithIdUpdate, hasTrustDataUpdate } from "../../../src/middleware/navigation/has.trust.middleware";
import { Session } from "@companieshouse/node-session-handler";
import { Params } from "express-serve-static-core";
import { ANY_MESSAGE_ERROR } from "../../__mocks__/text.mock";
import { APPLICATION_DATA_NO_TRUSTS_MOCK, APPLICATION_DATA_WITH_TRUST_ID_MOCK, TRUST_WITH_ID } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { SECURE_UPDATE_FILTER_URL, SOLD_LAND_FILTER_URL } from "../../../src/config";

describe("Trusts Middleware tests", () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;
  const next = jest.fn();

  const res = {
    status: jest.fn().mockReturnThis() as any,
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;

  let req = {} as Request;

  beforeEach(() => {
    logger.infoRequest = jest.fn();

    jest.clearAllMocks();
  });

  describe('register tests', () => {
    test("Trust present, return next", () => {
      req = {
        params: {
          trustId: TRUST_WITH_ID.trust_id,
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      hasTrustWithIdRegister(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Trust not present, redirect to landing page", () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      hasTrustWithIdRegister(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SOLD_LAND_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("Submission contains trust data", () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      hasTrustDataRegister(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Submission does not contain trust data", () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);

      hasTrustDataRegister(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SOLD_LAND_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("catch error when renders the page", () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      hasTrustWithIdRegister(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(error);
    });
  });

  describe('update tests', () => {
    test("Trust present, return next", () => {
      req = {
        params: {
          trustId: TRUST_WITH_ID.trust_id,
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      hasTrustWithIdUpdate(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Trust not present, redirect to landing page", () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      hasTrustWithIdUpdate(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SECURE_UPDATE_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("Submission contains trust data", () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      hasTrustDataUpdate(req, res, next);

      expect(next).toBeCalled();
      expect(res.redirect).not.toBeCalled();
    });

    test("Submission does not contain trust data", () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);

      hasTrustDataUpdate(req, res, next);

      expect(res.redirect).toBeCalled();
      expect(res.redirect).toBeCalledWith(SECURE_UPDATE_FILTER_URL);
      expect(next).not.toBeCalled();
    });

    test("catch error when renders the page", () => {
      req = {
        params: {
          trustId: "otherID",
        } as Params,
        session: {} as Session,
        route: "",
        method: "",
      } as Request;

      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      hasTrustWithIdUpdate(req, res, next);

      expect(next).toBeCalledTimes(1);
      expect(next).toBeCalledWith(error);
    });
  });
});
