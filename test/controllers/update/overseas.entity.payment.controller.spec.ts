jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/feature.flag" );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { PAYMENT_PAID, UPDATE_CONFIRMATION_PAGE, UPDATE_CONFIRMATION_URL, PAYMENT_FAILED_PAGE, UPDATE_PAYMENT_FAILED_URL } from "../../../src/config";
import app from "../../../src/app";
import { PaymentKey } from "../../../src/model/data.types.model";
import { PAYMENT_OBJECT_MOCK, PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING, UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING, UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { createAndLogErrorRequest, logger } from "../../../src/utils/logger";
import { ANY_MESSAGE_ERROR, FOUND_REDIRECT_TO, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

mockRemoveJourneyMiddleware.mockClear();

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe('OVERSEAS ENTITY PAYMENT controller suit', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should rejecting redirect, state does not match", async () => {
    mockGetApplicationData.mockReturnValueOnce( {} );
    await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerDebugRequest).not.toHaveBeenCalled();
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
  });

  test(`should redirect to ${UPDATE_CONFIRMATION_PAGE} page, Payment Successful with status ${PAYMENT_PAID}`, async () => {
    mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
    const resp = await request(app).get(UPDATE_PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);
    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_CONFIRMATION_URL}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to ${UPDATE_PAYMENT_FAILED_URL} page, Payment failed somehow`, async () => {
    mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
    const resp = await request(app).get(UPDATE_PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${UPDATE_PAYMENT_FAILED_URL}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to ${PAYMENT_FAILED_PAGE} page, if Payment failed through no change`, async () => {
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

  test('catch error on get request', async () => {
    mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
