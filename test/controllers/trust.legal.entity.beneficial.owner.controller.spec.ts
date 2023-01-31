jest.mock("ioredis");
jest.mock(".../../../src/utils/application.data");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/navigation/has.trust.middleware");
jest.mock("../../src/middleware/is.feature.enabled.middleware");
jest.mock("../../src/middleware/is.feature.enabled.middleware", () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock("../../src/utils/trusts");
jest.mock("../../src/utils/trust/common.trust.data.mapper");
jest.mock("../../src/utils/trust/legal.entity.beneficial.owner.mapper");

import { constants } from "http2";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextFunction, Request, Response } from "express";
import { Params } from "express-serve-static-core";
import { Session } from "@companieshouse/node-session-handler";
import request from "supertest";
import app from "../../src/app";
import {
  get,
  post,
  LEGAL_ENTITY_BO_TEXTS,
} from "../../src/controllers/trust.legal.entity.beneficial.owner.controller";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from "../__mocks__/text.mock";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrust } from "../../src/middleware/navigation/has.trust.middleware";
import {
  TRUST_ENTRY_URL,
  TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
  TRUST_INVOLVED_URL,
} from "../../src/config";
import { Trust, TrustCorporate, TrustKey } from "../../src/model/trust.model";
import {
  getApplicationData,
  setExtraData,
} from "../../src/utils/application.data";
import {
  getTrustByIdFromApp,
  saveLegalEntityBoInTrust,
  saveTrustInApp,
} from "../../src/utils/trusts";
import { mapCommonTrustDataToPage } from "../../src/utils/trust/common.trust.data.mapper";
import { mapLegalEntityToSession } from "../../src/utils/trust/legal.entity.beneficial.owner.mapper";

describe("Trust Legal Entity Beneficial Owner Controller", () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = "999999";
  const pageUrl =
    TRUST_ENTRY_URL + "/" + trustId + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;

  const mockTrust1Data = {
    trust_id: "999",
    trust_name: "dummyTrustName1",
  } as Trust;

  const mockTrust2Data = {
    trust_id: "802",
    trust_name: "dummyTrustName2",
  } as Trust;

  const mockTrust3Data = {
    trust_id: "803",
    trust_name: "dummyTrustName3",
  } as Trust;

  let mockAppData = {};

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockAppData = {
      [TrustKey]: [mockTrust1Data, mockTrust2Data, mockTrust3Data],
    };

    mockReq = {
      params: {
        trustId: trustId,
      } as Params,
      session: {} as Session,
      route: "",
      method: "",
      body: { body: "dummy" },
    } as Request;
  });

  describe("GET unit tests", () => {
    test("catch error when renders the page", () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe("POST unit tests", () => {
    test("Save", () => {
      const mockBoData = {} as TrustCorporate;
      (mapLegalEntityToSession as jest.Mock).mockReturnValue(mockBoData);

      mockGetApplicationData.mockReturnValue(mockAppData);

      const mockUpdatedTrust = {} as Trust;
      (saveLegalEntityBoInTrust as jest.Mock).mockReturnValue(mockBoData);

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const mockUpdatedAppData = {} as Trust;
      (saveTrustInApp as jest.Mock).mockReturnValue(mockUpdatedAppData);

      post(mockReq, mockRes, mockNext);

      expect(mapLegalEntityToSession).toBeCalledTimes(1);
      expect(mapLegalEntityToSession).toBeCalledWith(mockReq.body);

      expect(getTrustByIdFromApp).toBeCalledTimes(1);
      expect(getTrustByIdFromApp).toBeCalledWith(mockAppData, trustId);

      expect(saveLegalEntityBoInTrust).toBeCalledTimes(1);
      expect(saveLegalEntityBoInTrust).toBeCalledWith(mockTrust, mockBoData);

      expect(saveTrustInApp).toBeCalledTimes(1);
      expect(saveTrustInApp).toBeCalledWith(mockAppData, mockUpdatedTrust);

      expect(setExtraData as jest.Mock).toBeCalledWith(
        mockReq.session,
        mockUpdatedAppData
      );
    });

    test("catch error on post", () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mapLegalEntityToSession as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe("Endpoint Access tests with supertest", () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation(
        (_, __, next: NextFunction) => next()
      );
      (hasTrust as jest.Mock).mockImplementation((_, __, next: NextFunction) =>
        next()
      );
    });

    test(`successfully access GET method`, async () => {
      const mockTrust = {
        trustName: "dummyName",
      };
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(LEGAL_ENTITY_BO_TEXTS.title);
      expect(resp.text).toContain(mockTrust.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test("successfully access POST method", async () => {
      const resp = await request(app).post(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(
        `${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`
      );

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrust).toBeCalledTimes(1);
    });
  });
});
