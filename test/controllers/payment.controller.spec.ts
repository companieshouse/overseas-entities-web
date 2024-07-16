jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getApplicationData } from '../../src/utils/application.data';
import { createAndLogErrorRequest, logger } from '../../src/utils/logger';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithParamsToPath } from "../../src/utils/url";

import {
  PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  PAYMENT_OBJECT_MOCK,
  PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING
} from "../__mocks__/session.mock";
import {
  CONFIRMATION_PAGE,
  CONFIRMATION_URL,
  CONFIRMATION_WITH_PARAMS_URL,
  PAYMENT_FAILED_PAGE,
  PAYMENT_FAILED_URL,
  PAYMENT_FAILED_WITH_PARAMS_URL,
  PAYMENT_PAID
} from "../../src/config";
import { FOUND_REDIRECT_TO, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import { PaymentKey } from "../../src/model/data.types.model";

const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

describe("Payment controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockGetApplicationData.mockReset();
    mockLoggerDebugRequest.mockReset();
    process.env.FEATURE_FLAG_ENABLE_REDIS_REMOVAL = "false";
  });

  describe("GET tests for Payment controller without params url", () => {
    test("should rejecting redirect, state does not match", async () => {
      mockGetApplicationData.mockReturnValueOnce( {} );
      await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
    });

    test(`should redirect to ${CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID}`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
      const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should redirect to ${PAYMENT_FAILED_PAGE} page, Payment failed somehow`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
      const resp = await request(app).get(PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${PAYMENT_FAILED_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`Should render the error page`, async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });
  });

  describe("GET tests for Payment controller with params url", () => {

    test(`should redirect to ${CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID}`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
      const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(CONFIRMATION_WITH_PARAMS_URL);
    });

    test(`should redirect to ${PAYMENT_FAILED_PAGE} page, Payment failed somehow and feature flag active`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
      const resp = await request(app).get(PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${NEXT_PAGE_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(PAYMENT_FAILED_WITH_PARAMS_URL);
    });

  });
});
