jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";

import {
  ANY_MESSAGE_ERROR,
  BACK_BUTTON_CLASS,
  PAGE_TITLE_ERROR
} from '../__mocks__/text.mock';

import {
  TRUST_ENTRY_URL,
  TRUST_INTERRUPT_URL,
  TRUST_ENTRY_WITH_PARAMS_URL,
  TRUST_INTERRUPT_PAGE,
  BENEFICIAL_OWNER_TYPE_URL,
} from '../../src/config';

import { get, post, TRUST_INTERRUPT_TEXTS } from '../../src/controllers/trust.interrupt.controller';
import { authentication } from '../../src/middleware/authentication.middleware';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();

describe('Trust Interrupt controller', () => {

  const pageUrl = `${TRUST_ENTRY_URL}${TRUST_INTERRUPT_URL}`;
  const pageWithParamsUrl = `${TRUST_ENTRY_WITH_PARAMS_URL}${TRUST_INTERRUPT_URL}`;

  const mockIsActiveFeature = isActiveFeature as jest.Mock;

  const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
  mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

  const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
  mockGetUrlWithParamsToPath.mockReturnValue(`${TRUST_ENTRY_WITH_PARAMS_URL}`);

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      session: {} as Session,
      headers: {},
      route: '',
      method: '',
      body: {},
    } as Request;
    mockIsActiveFeature.mockReset();
  });

  describe('GET unit tests', () => {
    test(('success'), () => {

      get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();

      expect(mockRes.render).toBeCalledTimes(1);
    });
  });

  describe('POST unit tests', () => {
    test('continue button pushed', () => {
      post(mockReq, mockRes, mockNext);

      const firstTrustId = "1";
      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL + "/" + firstTrustId}`);
    });

    test('catch error when post data from page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST with params unit tests', () => {
    test('continue button pushed', () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      post(mockReq, mockRes, mockNext);

      const firstTrustId = "1";
      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_WITH_PARAMS_URL + "/" + firstTrustId}`);
    });

    test('catch error when post data from page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('Endpoint Access tests with supertest', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_INTERRUPT_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(authentication).toBeCalledTimes(1);
    });

    test(`renders ${TRUST_INTERRUPT_PAGE} on GET method with correct back link url when feature flag is on`, async () => {
      mockGetUrlWithParamsToPath.mockReturnValueOnce(`${TRUST_ENTRY_WITH_PARAMS_URL}`);
      mockIsActiveFeature.mockReturnValue(true);
      const resp = await request(app).get(pageWithParamsUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_ENTRY_WITH_PARAMS_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
    });

    test(`renders ${TRUST_INTERRUPT_PAGE} on GET method with correct back link url when feature flag is off`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(0);
    });

    test('successfully access POST method', async () => {
      const resp = await request(app).post(pageUrl);

      const firstTrustId = "1";

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_ENTRY_URL + "/" + firstTrustId}`);
      expect(authentication).toBeCalledTimes(1);
    });

    test('successfully access POST with params method', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const resp = await request(app).post(pageWithParamsUrl);

      const firstTrustId = "1";

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_ENTRY_WITH_PARAMS_URL + "/" + firstTrustId}`);
      expect(authentication).toBeCalledTimes(1);
    });
  });
});
