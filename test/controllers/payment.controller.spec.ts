jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { getApplicationData } from '../../src/utils/application.data';
import { createAndLogErrorRequest, logger } from '../../src/utils/logger';

import {
  PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING,
  PAYMENT_OBJECT_MOCK,
  PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING
} from "../__mocks__/session.mock";
import { CHECK_YOUR_ANSWERS_URL, CONFIRMATION_PAGE, CONFIRMATION_URL, PAYMENT_PAID } from "../../src/config";
import { FOUND_REDIRECT_TO, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import { PaymentKey } from "../../src/model/data.types.model";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Payment controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should rejecting redirect, state does not match", async () => {
    mockGetApplicationData.mockReturnValueOnce( {} );
    await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
  });

  test(`should redirect to ${CONFIRMATION_PAGE} page, Payment Successfull with status ${PAYMENT_PAID}`, async () => {
    mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
    const resp = await request(app).get(PAYMENT_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(2);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to ${CHECK_YOUR_ANSWERS_URL} page, Payment failed somehow`, async () => {
    mockGetApplicationData.mockReturnValueOnce( { [PaymentKey]: PAYMENT_OBJECT_MOCK } );
    const resp = await request(app).get(PAYMENT_DECLINED_WITH_TRANSACTION_URL_AND_QUERY_STRING);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CHECK_YOUR_ANSWERS_URL}`);
    expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(2);
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
