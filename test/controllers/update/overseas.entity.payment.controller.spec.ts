jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/feature.flag");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import app from "../../../src/app";

import { PaymentKey } from "../../../src/model/data.types.model";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { createAndLogErrorRequest, logger } from "../../../src/utils/logger";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { fetchApplicationData } from "../../../src/utils/application.data";

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
  APPLICATION_DATA_MOCK,
  PAYMENT_OBJECT_MOCK,
  PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING,
} from "../../__mocks__/session.mock";

mockJourneyDetectionMiddleware.mockClear();

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe('OVERSEAS ENTITY PAYMENT controller suit', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  test("should rejecting redirect, state does not match", async () => {
    mockFetchApplicationData.mockReturnValueOnce({});
    await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
  });

  test(`should redirect to ${UPDATE_CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID} when REDIS flag is set to OFF`, async () => {
    mockIsActiveFeature.mockReturnValue(false);
    mockFetchApplicationData.mockReturnValueOnce({ [PaymentKey]: PAYMENT_OBJECT_MOCK });
    const resp = await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_CONFIRMATION_URL}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to ${UPDATE_CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID} when REDIS flag is set to ON`, async () => {
    mockIsActiveFeature.mockReturnValue(true);
    mockFetchApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [PaymentKey]: PAYMENT_OBJECT_MOCK
    });
    const resp = await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_AN_OVERSEAS_ENTITY_URL}transaction/${TRANSACTION_ID}/submission/${OVERSEAS_ENTITY_ID}/${UPDATE_CONFIRMATION_PAGE}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to ${UPDATE_PAYMENT_FAILED_URL} page, Payment failed somehow`, async () => {
    mockFetchApplicationData.mockReturnValueOnce({ [PaymentKey]: PAYMENT_OBJECT_MOCK });
    const resp = await request(app).get(UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_PAYMENT_FAILED_URL}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to ${PAYMENT_FAILED_PAGE} page, if Payment failed through no change`, async () => {
    mockFetchApplicationData.mockReturnValueOnce(
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
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
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

  test('catch error on get request', async () => {
    mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
