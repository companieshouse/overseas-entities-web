jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/middleware/navigation/has.trust.middleware");
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/trust/details.mapper");
jest.mock("../../src/middleware/is.feature.enabled.middleware", () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/url');

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import * as config from "../../src/config";
import app from "../../src/app";
import { Session } from '@companieshouse/node-session-handler';
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from "../__mocks__/text.mock";
import { getApplicationData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrustDataRegister } from "../../src/middleware/navigation/has.trust.middleware";
import { Trust, TrustKey } from "../../src/model/trust.model";
import { generateTrustId } from "../../src/utils/trust/details.mapper";
import { get, post } from "../../src/controllers/add.trust.controller";
import { constants } from "http2";
import { ErrorMessages } from "../../src/validation/error.messages";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithParamsToPath } from "../../src/utils/url";
import { REGISTER_AN_OVERSEAS_ENTITY_URL } from "../../src/config";
import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const MOCKED_URL = REGISTER_AN_OVERSEAS_ENTITY_URL + "MOCKED_URL";
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_URL);

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
    mockIsActiveFeature.mockReset();

    mockAppData = {
      [TrustKey]: [mockTrust1Data],
    };

    mockReq = {
      session: {} as Session,
      headers: {},
      route: '',
      method: '',
      body: {},
    } as Request;
  });

  describe("GET tests", () => {
    test(`renders the ${config.ADD_TRUST_PAGE} page`, async () => {

      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

      await get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        config.ADD_TRUST_PAGE,
        expect.objectContaining({
          pageData: expect.objectContaining({
            trustData: [ mockTrust1Data ],
            isAddTrustQuestionToBeShown: true
          }),
        }),
      );
      // check REDIS Removal flags not included
      expect(mockRes.render).toBeCalledWith(
        config.ADD_TRUST_PAGE,
        expect.objectContaining({
          pageData: expect.not.objectContaining({
            FEATURE_FLAG_ENABLE_REDIS_REMOVAL: true,
            activeSubmissionBasePath: MOCKED_URL
          }),
        }),
      );
    });

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mockRes.render as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe("GET tests with url params", () => {
    test(`renders the ${config.ADD_TRUST_PAGE} page`, async () => {
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      await get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        config.ADD_TRUST_PAGE,
        expect.objectContaining({
          FEATURE_FLAG_ENABLE_REDIS_REMOVAL: true,
          activeSubmissionBasePath: MOCKED_URL,
          pageData: expect.objectContaining({
            trustData: [ mockTrust1Data ],
            isAddTrustQuestionToBeShown: true
          }),
        }),
      );
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test('catch error when renders the page with url params', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mockRes.render as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      await get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {
    test('select yes - Yes - for the current filing period to add trust', async () => {
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);
      (generateTrustId as jest.Mock).mockReturnValue(trustId);

      mockReq.body = {
        addTrust: 'addTrustYes',
      };

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${config.TRUST_DETAILS_URL}/${trustId}`);
    });
    test('select Yes - for the pre-registration period to add trust', async () => {
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);
      (generateTrustId as jest.Mock).mockReturnValue(trustId);

      mockReq.body = {
        addTrust: 'preRegistration',
      };

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${config.TRUST_DETAILS_URL}/${trustId}?relevant-period=true`);
    });
    test('catches post request errors', async () => {
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);
      (generateTrustId as jest.Mock).mockReturnValue(trustId);

      await post(mockReq, {} as Response, mockNext);
      expect(mockNext).toBeCalledTimes(1);
    });

    test('select yes to add trust', async () => {
      mockReq.body = {
        addTrust: '0',
      };

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${config.CHECK_YOUR_ANSWERS_URL}`);
    });
  });

  describe('POST unit tests with url params', () => {
    test('select yes to add trust with url params', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // SERVICE OFFLINE FEATURE FLAG
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
      mockIsActiveFeature.mockReturnValueOnce(true);// FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

      mockReq.body = {
        addTrust: 'addTrustYes',
      };

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.TRUST_ENTRY_WITH_PARAMS_URL);
    });

    test('no selection to add trust with url params - render with errors', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // SERVICE OFFLINE FEATURE FLAG
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
      mockIsActiveFeature.mockReturnValueOnce(true);// FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      (getApplicationData as jest.Mock).mockReturnValue(APPLICATION_DATA_MOCK);

      mockReq.url = "/register-an-overseas-entity/transaction/123/submission/456/trusts/add-trust";
      mockReq.body = {};

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.render).toBeCalledTimes(1);
      expect(generateTrustId).not.toHaveBeenCalled();
    });

    test(`renders the ${config.ADD_TRUST_PAGE} page with missing mandatory field messages`, async () => {
      // Arrange
      mockIsActiveFeature.mockReturnValueOnce(false); // SERVICE OFFLINE FEATURE FLAG
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
      mockIsActiveFeature.mockReturnValueOnce(true);// FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true);// FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustDataRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

      // Act
      const resp = await request(app).post(pageUrl).send({});

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(ErrorMessages.ADD_TRUST);
      expect(resp.text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.TRUSTS_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });
  });

  describe('Endpoint Access tests with supertest', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustDataRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // SERVICE OFFLINE FEATURE FLAG
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_WEB
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Trusts associated with the overseas entity');
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Active");
      expect(resp.text).not.toContain("Removed");

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustDataRegister).toBeCalledTimes(1);
    });

    test(`successfully access POST method`, async () => {

      const resp = await request(app).post(pageUrl).send({ addTrust: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.CHECK_YOUR_ANSWERS_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${config.ADD_TRUST_PAGE} page with missing mandatory field messages`, async () => {

      // Arrange
      const mockTrust = <Trust>{};
      (getApplicationData as jest.Mock).mockReturnValue(mockTrust);

      // Act
      const resp = await request(app).post(pageUrl).send({});

      // Assert
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(ErrorMessages.ADD_TRUST);
    });
  });
});
