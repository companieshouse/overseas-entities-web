jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/overseas-entities");
jest.mock("@companieshouse/api-sdk-node/dist/services/transaction/service");

jest.mock("../../src/utils/logger");
jest.mock("../../src/service/refresh.token.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { OverseasEntityService } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import * as TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

import { logger } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import { refreshToken } from "../../src/service/refresh.token.service";
import {
  APPLICATION_DATA_MOCK,
  fnNamePostOE,
  fnNamePostTransaction,
  fnNamePutOE,
  fnNamePutTransaction,
  getSessionRequestWithExtraData,
  mockNewAccessToken,
  OVERSEAS_ENTITY_ID,
  serviceNameOE,
  serviceNameTransaction,
  TRANSACTION_CLOSED_PARAMS,
  TRANSACTION_ID,
  TRANSACTION_POST_PARAMS
} from "../__mocks__/session.mock";

const mockPostOverseasEntity = OverseasEntityService.prototype.postOverseasEntity as jest.Mock;
const mockPutOverseasEntity = OverseasEntityService.prototype.putOverseasEntity as jest.Mock;

const mockPostTransaction = TransactionService.default.prototype.postTransaction as jest.Mock;
const mockPutTransaction = TransactionService.default.prototype.putTransaction as jest.Mock;

const mockDebugRequestLog = logger.debugRequest as jest.Mock;
const mockInfoRequestLog = logger.infoRequest as jest.Mock;

const mockRefreshToken = refreshToken as jest.Mock;
mockRefreshToken.mockReturnValue( mockNewAccessToken );

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({
  transaction: TransactionService.default.prototype,
  overseasEntity: OverseasEntityService.prototype,
} as ApiClient);

const session = getSessionRequestWithExtraData();
const req: Request = {} as Request;

describe(`OE Unauthorised Response Handler test suite`, () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe(`${serviceNameOE}.${fnNamePostOE} calls`, () => {
    const otherParamsPostOE = [TRANSACTION_ID, APPLICATION_DATA_MOCK, false];

    test(`${fnNamePostOE} should respond with created OE resource`, async () => {
      const mockResponse = { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } };
      mockPostOverseasEntity.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameOE, fnNamePostOE, req, session, ...otherParamsPostOE);

      expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
      expect(mockPostOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePostOE} should retry after unauthorised response`, async () => {
      const mockResponse = { httpStatusCode: 401 };
      const responseMsg = `Retrying ${fnNamePostOE} call on ${serviceNameOE} service after unauthorised response`;
      mockPostOverseasEntity.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameOE, fnNamePostOE, req, session, ...otherParamsPostOE);

      expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
      expect(mockPostOverseasEntity).toHaveBeenCalledTimes(2);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(2);

      expect(mockInfoRequestLog).toHaveBeenCalledTimes(3);
      expect(mockInfoRequestLog).toBeCalledWith(req, `Making a ${fnNamePostOE} call on ${serviceNameOE} service with token accessToken`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `${responseMsg} - ${JSON.stringify(mockResponse)}`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `New access token: ${mockNewAccessToken}`);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePostOE} should return immediately the error if not 401`, async () => {
      const mockResponse = { httpStatusCode: 500 };
      mockPostOverseasEntity.mockResolvedValueOnce( mockResponse);

      const response = await makeApiCallWithRetry(serviceNameOE, fnNamePostOE, req, session, ...otherParamsPostOE);

      expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
      expect(response).toEqual(mockResponse);

      expect(mockPostOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

  });

  describe(`${serviceNameOE}.${fnNamePutOE} calls`, () => {
    const otherParamsPutOE = [TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK];

    test(`${fnNamePutOE} should respond with created httpStatusCode`, async () => {
      const mockResponse = { httpStatusCode: 200 };
      mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameOE, fnNamePutOE, req, session, ...otherParamsPutOE);

      expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
      expect(mockPutOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePutOE} should retry after unauthorised response`, async () => {
      const mockResponse = { httpStatusCode: 401 };
      const responseMsg = `Retrying ${fnNamePutOE} call on ${serviceNameOE} service after unauthorised response`;
      mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameOE, fnNamePutOE, req, session, ...otherParamsPutOE);

      expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
      expect(mockPutOverseasEntity).toHaveBeenCalledTimes(2);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(2);

      expect(mockInfoRequestLog).toHaveBeenCalledTimes(3);
      expect(mockInfoRequestLog).toBeCalledWith(req, `Making a ${fnNamePutOE} call on ${serviceNameOE} service with token accessToken`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `${responseMsg} - ${JSON.stringify(mockResponse)}`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `New access token: ${mockNewAccessToken}`);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePutOE} should return immediately the error if not 401`, async () => {
      const mockResponse = { httpStatusCode: 500 };
      mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);

      const response = await makeApiCallWithRetry(serviceNameOE, fnNamePutOE, req, session, ...otherParamsPutOE);

      expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
      expect(response).toEqual(mockResponse);

      expect(mockPutOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);

      expect(mockInfoRequestLog).toBeCalledWith(req, `Making a ${fnNamePutOE} call on ${serviceNameOE} service with token accessToken`);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

  });

});

describe(`Transaction Unauthorised Response Handler test suite`, () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe(`${serviceNameTransaction}.${fnNamePostTransaction} calls`, () => {

    test(`${fnNamePostTransaction} should respond with created Transaction resource`, async () => {
      const mockResponse = { httpStatusCode: 200, resource: { id: TRANSACTION_ID } };
      mockPostTransaction.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameTransaction, fnNamePostTransaction, req, session, TRANSACTION_POST_PARAMS);

      expect(mockPostTransaction).toBeCalledWith(TRANSACTION_POST_PARAMS);
      expect(mockPostTransaction).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePostTransaction} should retry after unauthorised response`, async () => {
      const mockResponse = { httpStatusCode: 401 };
      const responseMsg = `Retrying ${fnNamePostTransaction} call on ${serviceNameTransaction} service after unauthorised response`;
      mockPostTransaction.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameTransaction, fnNamePostTransaction, req, session, TRANSACTION_POST_PARAMS);

      expect(mockPostTransaction).toBeCalledWith(TRANSACTION_POST_PARAMS);
      expect(mockPostTransaction).toHaveBeenCalledTimes(2);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(2);

      expect(mockInfoRequestLog).toHaveBeenCalledTimes(3);
      expect(mockInfoRequestLog).toBeCalledWith(req, `Making a ${fnNamePostTransaction} call on ${serviceNameTransaction} service with token accessToken`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `${responseMsg} - ${JSON.stringify(mockResponse)}`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `New access token: ${mockNewAccessToken}`);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePostTransaction} should return immediately the error if not 401`, async () => {
      const mockResponse = { httpStatusCode: 500 };
      mockPostTransaction.mockResolvedValueOnce( mockResponse);

      const response = await makeApiCallWithRetry(serviceNameTransaction, fnNamePostTransaction, req, session, TRANSACTION_POST_PARAMS);

      expect(mockPostTransaction).toBeCalledWith(TRANSACTION_POST_PARAMS);
      expect(response).toEqual(mockResponse);

      expect(mockPostTransaction).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

  });

  describe(`${serviceNameTransaction}.${fnNamePutTransaction} calls`, () => {

    test(`${fnNamePutTransaction} should respond with httpStatusCode 200`, async () => {
      const mockResponse = { httpStatusCode: 200 };
      mockPutTransaction.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameTransaction, fnNamePutTransaction, req, session, TRANSACTION_CLOSED_PARAMS);

      expect(mockPutTransaction).toBeCalledWith(TRANSACTION_CLOSED_PARAMS);
      expect(mockPutTransaction).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePutTransaction} should retry after unauthorised response`, async () => {
      const mockResponse = { httpStatusCode: 401 };
      const responseMsg = `Retrying ${fnNamePutTransaction} call on ${serviceNameTransaction} service after unauthorised response`;
      mockPutTransaction.mockResolvedValueOnce( mockResponse);

      await makeApiCallWithRetry(serviceNameTransaction, fnNamePutTransaction, req, session, TRANSACTION_CLOSED_PARAMS);

      expect(mockPutTransaction).toBeCalledWith(TRANSACTION_CLOSED_PARAMS);
      expect(mockPutTransaction).toHaveBeenCalledTimes(2);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(2);

      expect(mockInfoRequestLog).toHaveBeenCalledTimes(3);
      expect(mockInfoRequestLog).toBeCalledWith(req, `Making a ${fnNamePutTransaction} call on ${serviceNameTransaction} service with token accessToken`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `${responseMsg} - ${JSON.stringify(mockResponse)}`);
      expect(mockInfoRequestLog).toBeCalledWith(req, `New access token: ${mockNewAccessToken}`);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePutTransaction} should return immediately the error if not 401`, async () => {
      const mockResponse = { httpStatusCode: 500 };
      mockPutTransaction.mockResolvedValueOnce( mockResponse);

      const response = await makeApiCallWithRetry(serviceNameTransaction, fnNamePutTransaction, req, session, TRANSACTION_CLOSED_PARAMS);

      expect(mockPutTransaction).toBeCalledWith(TRANSACTION_CLOSED_PARAMS);
      expect(response).toEqual(mockResponse);

      expect(mockPutTransaction).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);

      expect(mockDebugRequestLog).toBeCalledWith(req, `Call successful.`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);
    });

  });

});
