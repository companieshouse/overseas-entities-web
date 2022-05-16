jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/transaction/service");
jest.mock('../../src/utils/logger');
jest.mock("../../src/utils/feature.flag" );

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

// import { createApiClient } from "@companieshouse/api-sdk-node";
// import { PaymentService } from "@companieshouse/api-sdk-node/dist/services/payment";
import { CONFIRMATION_URL, PAYMENT_REQUIRED_HEADER } from "../../src/config";
import { startPaymentsSession } from "../../src/service/payment.service";
import {
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  PAYMENT_HEADER,
  TRANSACTION_CLOSED_RESPONSE,
  TRANSACTION_ID,
} from "../__mocks__/session.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";

// const mockCreatePayment = PaymentService.prototype.createPaymentWithFullUrl as jest.Mock;
// const mockCreateApiClient = createApiClient as jest.Mock;
// mockCreateApiClient.mockReturnValue({ overseasEntity: OverseasEntityService.prototype } as ApiClient);

const req: Request = {} as Request;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockImplementation( () => true );

describe('Payment Service test suite', () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`startPaymentsSession() should return ${CONFIRMATION_URL} if ${PAYMENT_REQUIRED_HEADER} blank`, async () => {
    const response = await startPaymentsSession(
      req,
      getSessionRequestWithExtraData(),
      TRANSACTION_ID,
      OVERSEAS_ENTITY_ID,
      TRANSACTION_CLOSED_RESPONSE
    );

    expect(response).toEqual(CONFIRMATION_URL);
  });

  test(`startPaymentsSession() should return ${CONFIRMATION_URL} if FEATURE_FLAG_PAYMENT is 'false', '0', 'off' or ""`, async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await startPaymentsSession(
      req,
      getSessionRequestWithExtraData(),
      TRANSACTION_ID,
      OVERSEAS_ENTITY_ID,
      { ...TRANSACTION_CLOSED_RESPONSE, headers: PAYMENT_HEADER }
    );

    expect(response).toEqual(CONFIRMATION_URL);
  });

});

