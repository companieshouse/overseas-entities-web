jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import { createAndLogErrorRequest, logger } from '../../src/utils/logger';
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK, PAYMENT_OBJECT_MOCK, PAYMENT_WITH_TRANSACTION_URL, PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING } from "../__mocks__/session.mock";
import { paymentType } from "../../src/model";
import { CONFIRMATION_PAGE, CONFIRMATION_URL, PAYMENT_PAID } from "../../src/config";
import { FOUND_REDIRECT_TO, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Payment controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 500 and rejecting redirect, state does not match", async () => {
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(resp.status).toEqual(500);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
  });

  test(`should redirect the ${CONFIRMATION_PAGE} page, Payment Successfull with status ${PAYMENT_PAID}`, async () => {
    mockGetApplicationData.mockReturnValueOnce( { [paymentType.PaymentKey]: PAYMENT_OBJECT_MOCK } );
    const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    // expect(resp.status).toEqual(302);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(2);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`catch error when post to ${PAYMENT_WITH_TRANSACTION_URL} page`, async () => {
    mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
    const resp = await request(app).post(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
