jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { PaymentKey } from "../../src/model/data.types.model";
import { authentication } from "../../src/middleware/authentication.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { fetchApplicationData } from '../../src/utils/application.data';
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";

import { createAndLogErrorRequest, logger } from '../../src/utils/logger';

import {
  MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  SERVICE_UNAVAILABLE,
} from "../__mocks__/text.mock";

import {
  PAYMENT_PAID,
  CONFIRMATION_URL,
  CONFIRMATION_PAGE,
  PAYMENT_FAILED_URL,
  PAYMENT_FAILED_PAGE,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
} from "../../src/config";

import {
  TRANSACTION_ID,
  OVERSEAS_ENTITY_ID,
  PAYMENT_OBJECT_MOCK,
  APPLICATION_DATA_MOCK,
  PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING,
} from "../__mocks__/session.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe("Payment controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockFetchApplicationData.mockReset();
    mockLoggerDebugRequest.mockReset();
    process.env.FEATURE_FLAG_ENABLE_REDIS_REMOVAL = "false";
  });

  describe("GET tests for Payment controller without params url", () => {

    test("should rejecting redirect, state does not match", async () => {
      mockFetchApplicationData.mockReturnValueOnce({});
      await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(4);
      expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
    });

    test(`should redirect to ${CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [PaymentKey]: PAYMENT_OBJECT_MOCK
      });

      const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(CONFIRMATION_URL);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(4);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should redirect to ${PAYMENT_FAILED_PAGE} page, Payment failed somehow`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [PaymentKey]: PAYMENT_OBJECT_MOCK });

      const resp = await request(app).get(PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${REGISTER_AN_OVERSEAS_ENTITY_URL}${PAYMENT_FAILED_PAGE}`);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${PAYMENT_FAILED_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(4);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`Should render the error page`, async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
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
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [PaymentKey]: PAYMENT_OBJECT_MOCK
      });
      const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${REGISTER_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/submission/${OVERSEAS_ENTITY_ID}/${CONFIRMATION_PAGE}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(4);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should redirect to ${PAYMENT_FAILED_PAGE} page, Payment failed somehow and feature flag active`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [PaymentKey]: PAYMENT_OBJECT_MOCK
      });

      const resp = await request(app).get(PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${REGISTER_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/submission/${OVERSEAS_ENTITY_ID}/${PAYMENT_FAILED_PAGE}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(4);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

  });
});
