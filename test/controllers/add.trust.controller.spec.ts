jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/middleware/navigation/has.trust.middleware");
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/trust/details.mapper");
jest.mock("../../src/middleware/is.feature.enabled.middleware", () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import * as config from "../../src/config";
import app from "../../src/app";
import { Session } from '@companieshouse/node-session-handler';
import { Params } from 'express-serve-static-core';
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from "../__mocks__/text.mock";
import { getApplicationData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrust } from "../../src/middleware/navigation/has.trust.middleware";
import { Trust, TrustKey } from "../../src/model/trust.model";
import { generateTrustId } from "../../src/utils/trust/details.mapper";
import { get, ADD_TRUST_TEXTS, post } from "../../src/controllers/add.trust.controller";

describe("Add Trust Controller Tests", () => {

  const trustId = "939";
  const pageUrl = `${config.TRUST_ENTRY_URL + config.ADD_TRUST_URL}`;

  const mockTrust1Data = {
    trust_id: "999",
    trust_name: "dummyTrustName1",
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
      [TrustKey]: [mockTrust1Data],
    };

    mockReq = {
      params: {
        trustId: trustId,
      } as Params,
      session: {} as Session,
      route: '',
      method: '',
      body: {},
    } as Request;
  });

  describe("GET tests", () => {
    test(`renders the ${config.ADD_TRUST_PAGE} page`, () => {
      get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();

      expect(mockRes.render).toBeCalledTimes(1);
    });

    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mockRes.render as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {
    test('select yes to add trust', () => {
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);
      (generateTrustId as jest.Mock).mockReturnValue(trustId);

      mockReq.body = {
        addTrust: '1',
      };

      post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${config.TRUST_DETAILS_URL}/${trustId}`);
    });

    test('select yes to add trust', () => {
      mockReq.body = {
        addTrust: '0',
      };

      post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${config.CHECK_YOUR_ANSWERS_URL}`);
    });
  });

  describe('Endpoint Access tests with supertest', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrust as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ADD_TRUST_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrust).toBeCalledTimes(1);
    });
  });
});
