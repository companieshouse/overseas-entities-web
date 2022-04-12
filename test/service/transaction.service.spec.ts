jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/transaction/service");
jest.mock('../../src/utils/logger');

import { describe, expect, test, jest, beforeEach } from "@jest/globals";

import { createApiClient } from "@companieshouse/api-sdk-node";
import * as TransactionService from "@companieshouse/api-sdk-node/dist/services/transaction/service";

import {
  ERROR,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  TRANSACTION,
  TRANSACTION_ID,
} from "../__mocks__/session.mock";
import { closeTransaction, postTransaction } from "../../src/service/transaction.service";
import { createAndLogError, logger } from '../../src/utils/logger';
import { HTTP_STATUS_CODE_500, TRANSACTION_ERROR } from "../__mocks__/text.mock";

const mockDebugLog = logger.debug as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(ERROR);

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ transaction: TransactionService.default.prototype });

const mockPostTransaction = TransactionService.default.prototype.postTransaction as jest.Mock;
const mockPutTransaction = TransactionService.default.prototype.putTransaction as jest.Mock;
const session = getSessionRequestWithExtraData();

describe('Transaction Service test suite', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe('POST Transaction', () => {
    test('Should successfully post a transaction', async () => {
      mockPostTransaction.mockResolvedValueOnce({ httpStatusCode: 200, resource: TRANSACTION });
      const response = await postTransaction(session) as any;

      expect(response.reference).toEqual(TRANSACTION.reference);
      expect(response.description).toEqual(TRANSACTION.description);
      expect(mockDebugLog).toBeCalledTimes(1);
    });

    test(`Should throw an error (${HTTP_STATUS_CODE_500}) when httpStatusCode 500`, async () => {
      mockPostTransaction.mockResolvedValueOnce({ httpStatusCode: 500 });

      await expect( postTransaction(session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(HTTP_STATUS_CODE_500);
      expect(mockDebugLog).not.toHaveBeenCalled();
    });

    test(`Should throw an error (${TRANSACTION_ERROR}) when no transaction api response`, async () => {
      mockPostTransaction.mockResolvedValueOnce({ httpStatusCode: 200 });

      await expect( postTransaction(session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`POST - ${TRANSACTION_ERROR}`);
      expect(mockDebugLog).not.toHaveBeenCalled();
    });
  });

  describe('CLOSE Transaction', () => {
    test('Should successfully update (change status to close) transaction', async () => {
      mockPutTransaction.mockResolvedValueOnce({ httpStatusCode: 200, resource: TRANSACTION });
      const response = await closeTransaction(session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) as any;

      expect(response.httpStatusCode).toEqual(200);
      expect(response.resource.reference).toEqual(TRANSACTION.reference);
      expect(response.resource.description).toEqual(TRANSACTION.description);
      expect(mockDebugLog).toBeCalledTimes(1);
    });

    test(`Should throw an error (${HTTP_STATUS_CODE_500}) when httpStatusCode 500`, async () => {
      mockPutTransaction.mockResolvedValueOnce({ httpStatusCode: 500 });

      await expect( closeTransaction(session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(HTTP_STATUS_CODE_500);
      expect(mockDebugLog).not.toHaveBeenCalled();
    });

    test(`Should throw an error (${TRANSACTION_ERROR}) when no response returned`, async () => {
      mockPutTransaction.mockResolvedValueOnce(null);

      await expect( closeTransaction(session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`PUT - ${TRANSACTION_ERROR}`);
      expect(mockDebugLog).not.toHaveBeenCalled();
    });
  });

});
