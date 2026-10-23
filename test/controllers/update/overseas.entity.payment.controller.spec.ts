jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/feature.flag");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import request from "supertest";

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import app from "../../../src/app";

import { get } from "../../../src/controllers/update/payment.controller";
import { PaymentKey } from "../../../src/model/data.types.model";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { PAYMENT_REF_MOCK } from "../../__mocks__/payment.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { createAndLogErrorRequest, logger } from "../../../src/utils/logger";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import {
  MESSAGE_ERROR,
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";

import {
  PAYMENT_PAID,
  PAYMENT_FAILED_PAGE,
  UPDATE_CONFIRMATION_URL,
  UPDATE_CONFIRMATION_PAGE,
  UPDATE_PAYMENT_FAILED_URL,
  UPDATE_AN_OVERSEAS_ENTITY_URL
} from "../../../src/config";

import {
  TRANSACTION_ID,
  OVERSEAS_ENTITY_ID,
  PAYMENT_OBJECT_MOCK,
  APPLICATION_DATA_MOCK,
  PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING,
} from "../../__mocks__/session.mock";

const mockNext = jest.fn();

const mockRes = {
  render: jest.fn() as any,
  redirect: jest.fn() as any,
} as Response;

const mockReq = {
  session: {} as Session,
  headers: {},
  params: {},
} as Request;

mockJourneyDetectionMiddleware.mockClear();

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe('OVERSEAS ENTITY PAYMENT controller suite', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe('when REDIS flag is set to ON', () => {

    beforeEach(() => {
      mockReq.url = PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING;
      mockReq.session.getExtraData = jest.fn().mockReturnValue(PAYMENT_REF_MOCK);
      mockReq.session.deleteExtraData = jest.fn().mockReturnValue(true);
      mockReq.query = {
        status: PAYMENT_PAID,
        state: PAYMENT_REF_MOCK.state
      };
      mockReq.params = {
        transactionId: TRANSACTION_ID,
        overseasEntityId: OVERSEAS_ENTITY_ID
      };
    });

    test(`should redirect to ${UPDATE_CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID}`, async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [PaymentKey]: PAYMENT_OBJECT_MOCK
      });
      await get(mockReq, mockRes, mockNext);
      expect(mockRes.redirect).toBeCalledWith(`${UPDATE_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/submission/${OVERSEAS_ENTITY_ID}/${UPDATE_CONFIRMATION_PAGE}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfo).toHaveBeenCalledTimes(2);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockReq.session.getExtraData).toHaveBeenCalledTimes(1);
      expect(mockReq.session.deleteExtraData).toHaveBeenCalledTimes(1);
    });

    test(`should redirect to ${UPDATE_PAYMENT_FAILED_URL} page, Payment failed when status is not ${PAYMENT_PAID}`, async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [PaymentKey]: PAYMENT_OBJECT_MOCK
      });
      mockReq.query = {
        ...mockReq.query,
        status: null,
      };
      await get(mockReq, mockRes, mockNext);
      expect(mockRes.redirect).toBeCalledWith(`${UPDATE_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/submission/${OVERSEAS_ENTITY_ID}/${PAYMENT_FAILED_PAGE}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfo).toHaveBeenCalledTimes(2);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
      expect(mockReq.session.getExtraData).toHaveBeenCalledTimes(1);
      expect(mockReq.session.deleteExtraData).toHaveBeenCalledTimes(1);
    });

  });

  describe('when feature flags are set to OFF', () => {

    test("should rejecting redirect, state does not match", async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetApplicationData.mockReturnValueOnce({});
      await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(3);
      expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
    });

    test(`should redirect to ${UPDATE_CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID}`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetApplicationData.mockReturnValueOnce({ [PaymentKey]: PAYMENT_OBJECT_MOCK });
      const resp = await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_CONFIRMATION_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(3);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should redirect to ${UPDATE_PAYMENT_FAILED_URL} page, Payment failed somehow`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetApplicationData.mockReturnValueOnce({ [PaymentKey]: PAYMENT_OBJECT_MOCK });
      const resp = await request(app).get(UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);
      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_PAYMENT_FAILED_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(3);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should redirect to ${PAYMENT_FAILED_PAGE} page, if Payment failed through no change`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetApplicationData.mockReturnValueOnce(
        {
          [PaymentKey]: PAYMENT_OBJECT_MOCK,
          update: {
            no_change: true
          }
        });

      const resp = await request(app).get(UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);
      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_PAYMENT_FAILED_URL}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(3);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`Should render the error page`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test('catch error on get request', async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
