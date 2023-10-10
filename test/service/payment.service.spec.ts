/* eslint-disable no-useless-escape */
jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/payment");
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import { Request } from "express";
import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { Payment, PaymentService } from "@companieshouse/api-sdk-node/dist/services/payment";

import { CONFIRMATION_URL, CONFIRMATION_WITH_PARAMS_URL, PAYMENT_REQUIRED_HEADER } from "../../src/config";
import { startPaymentsSession } from "../../src/service/payment.service";
import {
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  PAYMENT_FAILURE_MOCK_VALUE,
  PAYMENT_JOURNEY_URL,
  PAYMENT_MOCK_VALUE,
  TRANSACTION_CLOSED_RESPONSE,
  TRANSACTION_ID,
  TRANSACTION_WITH_PAYMENT_HEADER,
} from "../__mocks__/session.mock";
import { ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  NO_RESOURCE_ON_PAYMENT_RESPONSE_MSG_ERROR,
  PAYMENT_RESPONSE_500_MSG_ERROR,
  PAYMENT_RESPONSE_NO_STATUS_CODE_MSG_ERROR,
} from "../__mocks__/text.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithParamsToPath } from "../../src/utils/url";

const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockCreatePayment = PaymentService.prototype.createPaymentWithFullUrl as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockIsFailure = jest.fn();
mockIsFailure.mockReturnValue(false);
const mockIsSuccess = jest.fn();
mockIsSuccess.mockReturnValue(true);
const mockPaymentResult: ApiResult<ApiResponse<Payment>> = {
  isFailure: mockIsFailure,
  value: PAYMENT_MOCK_VALUE,
  isSuccess: mockIsSuccess
};

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ payment: PaymentService.prototype });
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

const session = getSessionRequestWithExtraData();
const req: Request = { headers: {} } as Request;

beforeEach (() => {
  jest.clearAllMocks();
  mockIsActiveFeature.mockReset();
  process.env.FEATURE_FLAG_ENABLE_REDIS_REMOVAL = "false";
});

describe('Payment Service test suite', () => {

  test(`startPaymentsSession() should return ${CONFIRMATION_URL} if ${PAYMENT_REQUIRED_HEADER} blank`, async () => {
    const response = await startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_CLOSED_RESPONSE );

    expect(response).toEqual(CONFIRMATION_URL);
  });

  test(`startPaymentsSession() should return the first page to initiate the web journey ${PAYMENT_JOURNEY_URL}`, async () => {
    mockCreatePayment.mockResolvedValueOnce( mockPaymentResult );
    const response = await startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_WITH_PAYMENT_HEADER);

    expect(response).toEqual(PAYMENT_JOURNEY_URL);
  });

  test(`startPaymentsSession() should throw ${NO_RESOURCE_ON_PAYMENT_RESPONSE_MSG_ERROR} error msg`, async () => {
    mockCreatePayment.mockResolvedValueOnce( { ...mockPaymentResult, value: undefined } );
    await expect(
      startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_WITH_PAYMENT_HEADER)
    ).rejects.toThrow(NO_RESOURCE_ON_PAYMENT_RESPONSE_MSG_ERROR);
  });

  test(`startPaymentsSession() should throw ${PAYMENT_RESPONSE_500_MSG_ERROR} error msg`, async () => {
    mockIsFailure.mockReturnValue(true);
    mockCreatePayment.mockResolvedValueOnce( { ...mockPaymentResult, value: PAYMENT_FAILURE_MOCK_VALUE } );
    await expect(
      startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_WITH_PAYMENT_HEADER)
    ).rejects.toThrow(PAYMENT_RESPONSE_500_MSG_ERROR);
  });

  test(`startPaymentsSession() should throw ${PAYMENT_RESPONSE_NO_STATUS_CODE_MSG_ERROR} error msg`, async () => {
    mockIsFailure.mockReturnValue(true);
    mockCreatePayment.mockResolvedValueOnce( { ...mockPaymentResult, value: { errors: undefined, httpStatusCode: undefined } } );
    await expect(
      startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_WITH_PAYMENT_HEADER)
    ).rejects.toThrow(PAYMENT_RESPONSE_NO_STATUS_CODE_MSG_ERROR);
  });

  test(`startPaymentsSession() should throw ${PAYMENT_RESPONSE_NO_STATUS_CODE_MSG_ERROR} error msg - No error response`, async () => {
    mockIsFailure.mockReturnValue(true);
    mockCreatePayment.mockResolvedValueOnce( { ...mockPaymentResult, value: undefined } );
    await expect(
      startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_WITH_PAYMENT_HEADER)
    ).rejects.toThrow(PAYMENT_RESPONSE_NO_STATUS_CODE_MSG_ERROR);
  });

});

describe('Payment Service test suite with params url', () => {

  test(`startPaymentsSession() should return ${CONFIRMATION_WITH_PARAMS_URL} if ${PAYMENT_REQUIRED_HEADER} blank`, async () => {
    mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    const response = await startPaymentsSession(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, TRANSACTION_CLOSED_RESPONSE );

    expect(response).toEqual(NEXT_PAGE_URL);
    expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
    expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(CONFIRMATION_WITH_PARAMS_URL);
  });

});
