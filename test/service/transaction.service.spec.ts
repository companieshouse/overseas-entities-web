jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/transaction/service");
jest.mock('../../src/utils/logger');

import { describe, expect, test, jest, beforeEach } from "@jest/globals";

import { createApiClient } from "@companieshouse/api-sdk-node";
import * as TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";

import {
  APPLICATION_DATA_MOCK,
  ERROR,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  TRANSACTION,
  TRANSACTION_ID,
} from "../__mocks__/session.mock";
import { closeTransaction, postTransaction } from "../../src/service/transaction.service";
import { createAndLogErrorRequest, logger } from '../../src/utils/logger';
import { HTTP_STATUS_CODE_500, TRANSACTION_ERROR } from "../__mocks__/text.mock";
import { Request } from "express";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { DESCRIPTION, REFERENCE } from "../../src/config";

const mockDebugRequestLog = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ transaction: TransactionService.default.prototype });

const mockPostTransaction = TransactionService.default.prototype.postTransaction as jest.Mock;
const mockPutTransaction = TransactionService.default.prototype.putTransaction as jest.Mock;
const session = getSessionRequestWithExtraData();
const req: Request = {} as Request;

describe('Transaction Service test suite', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe('POST Transaction', () => {
    test.only('Should successfully post a transaction', async () => {
      mockPostTransaction.mockResolvedValueOnce({ httpStatusCode: 200, resource: TRANSACTION });
      const response = await postTransaction(req, session) as any;

      const transaction: Transaction = { reference: REFERENCE, companyName: APPLICATION_DATA_MOCK.entity?.name, description: DESCRIPTION };
      expect(mockPostTransaction).toBeCalledWith(transaction);

      expect(response.reference).toEqual(TRANSACTION.reference);
      expect(response.description).toEqual(TRANSACTION.description);
      expect(mockDebugRequestLog).toBeCalledTimes(1);
    });

    test(`Should throw an error (${HTTP_STATUS_CODE_500}) when httpStatusCode 500`, async () => {
      mockPostTransaction.mockResolvedValueOnce({ httpStatusCode: 500 });

      await expect( postTransaction(req, session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, HTTP_STATUS_CODE_500);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
    });

    test(`Should throw an error (${TRANSACTION_ERROR}) when no transaction api response`, async () => {
      mockPostTransaction.mockResolvedValueOnce({ httpStatusCode: 200 });

      await expect( postTransaction(req, session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `POST - ${TRANSACTION_ERROR}`);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
    });
  });

  describe('CLOSE Transaction', () => {
    test('Should successfully update (change status to close) transaction', async () => {
      mockPutTransaction.mockResolvedValueOnce({ httpStatusCode: 200, resource: TRANSACTION });
      const response = await closeTransaction(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) as any;

      expect(response.httpStatusCode).toEqual(200);
      expect(response.resource.reference).toEqual(TRANSACTION.reference);
      expect(response.resource.description).toEqual(TRANSACTION.description);
      expect(mockDebugRequestLog).toBeCalledTimes(1);
    });

    test(`Should throw an error (${HTTP_STATUS_CODE_500}) when httpStatusCode 500`, async () => {
      mockPutTransaction.mockResolvedValueOnce({ httpStatusCode: 500 });

      await expect( closeTransaction(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, HTTP_STATUS_CODE_500);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
    });

    test(`Should throw an error (${TRANSACTION_ERROR}) when no response returned`, async () => {
      mockPutTransaction.mockResolvedValueOnce(null);

      await expect( closeTransaction(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `PUT - ${TRANSACTION_ERROR}`);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
    });
  });

});
