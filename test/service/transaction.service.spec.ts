jest.mock('../../src/utils/logger');
jest.mock("../../src/utils/application.data");
jest.mock("../../src/utils/url");
jest.mock("../../src/service/retry.handler.service");

import { Request } from "express";
import { createAndLogErrorRequest, logger } from '../../src/utils/logger';
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import { isRegistrationJourney, } from "../../src/utils/url";
import { fetchApplicationData } from "../../src/utils/application.data";

import { EntityNameKey, EntityNumberKey } from "../../src/model/data.types.model";

import {
  closeTransaction,
  postTransaction,
  getTransaction
} from "../../src/service/transaction.service";

import {
  MOCK_GET_ERROR_TRANSACTION_RESPONSE,
  MOCK_GET_TRANSACTION_RESPONSE,
  MOCK_TRANSACTION_ID
} from "../__mocks__/transaction.mock";

import {
  APPLICATION_DATA_MOCK,
  COMPANY_NUMBER,
  ERROR,
  fnNameGetTransaction,
  fnNamePostTransaction,
  fnNamePutTransaction,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  OVERSEAS_NAME_MOCK,
  serviceNameTransaction,
  TRANSACTION,
  TRANSACTION_CLOSED_PARAMS,
  TRANSACTION_CLOSED_RESPONSE,
  TRANSACTION_ID,
  TRANSACTION_POST_PARAMS,
} from "../__mocks__/session.mock";

const mockInfoRequestLog = logger.infoRequest as jest.Mock;

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

const session = getSessionRequestWithExtraData();
const req: Request = {} as Request;

describe('Transaction Service test suite', () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe('POST Transaction', () => {

    test(`Should successfully post a transaction when ${EntityNameKey} is blank`, async () => {
      const companyNumber = "undefined";
      const companyName = 'undefined';
      mockFetchApplicationData.mockReturnValueOnce( { ...APPLICATION_DATA_MOCK, [EntityNameKey]: companyName, [EntityNumberKey]: companyNumber } );
      const mockResponse = { httpStatusCode: 200, resource: TRANSACTION };
      mockMakeApiCallWithRetry.mockReturnValueOnce( mockResponse );
      const response = await postTransaction(req, session);

      expect(mockMakeApiCallWithRetry).toBeCalledWith(
        serviceNameTransaction, fnNamePostTransaction, req, session, { ...TRANSACTION_POST_PARAMS, companyName: companyName, companyNumber: companyNumber }
      );

      expect(response).toEqual(TRANSACTION_ID);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postTransaction' for company number '${companyNumber}' with name '${companyName}'`);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'postTransaction' for company number '${companyNumber}' with name '${companyName}': ${JSON.stringify(mockResponse)}`);
    });

    test(`Should successfully post a transaction when ${EntityNameKey} is not blank`, async () => {
      const companyNumber = "OE111129";
      const companyName = 'overseasEntityName';
      mockFetchApplicationData.mockReturnValueOnce( { ...APPLICATION_DATA_MOCK, [EntityNameKey]: companyName, [EntityNumberKey]: companyNumber } );
      const mockResponse = { httpStatusCode: 200, resource: TRANSACTION };
      mockMakeApiCallWithRetry.mockReturnValueOnce(mockResponse);
      const response = await postTransaction(req, session);

      expect(mockMakeApiCallWithRetry).toBeCalledWith(
        serviceNameTransaction, fnNamePostTransaction, req, session, TRANSACTION_POST_PARAMS
      );

      expect(response).toEqual(TRANSACTION_ID);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postTransaction' for company number '${companyNumber}' with name '${companyName}'`);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'postTransaction' for company number '${companyNumber}' with name '${companyName}': ${JSON.stringify(mockResponse)}`);
    });

    test(`Should throw an error when HTTP status code is 500`, async () => {
      mockFetchApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
      mockMakeApiCallWithRetry.mockReturnValueOnce( { httpStatusCode: 500 } );
      await expect( postTransaction(req, session) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postTransaction' for company number '${COMPANY_NUMBER}' with name '${OVERSEAS_NAME_MOCK}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `'postTransaction' for company number '${COMPANY_NUMBER}' with name '${OVERSEAS_NAME_MOCK}' returned HTTP status code 500`);
    });

    test(`Should throw an error when no transaction api response is received`, async () => {
      mockFetchApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
      mockMakeApiCallWithRetry.mockResolvedValueOnce({ httpStatusCode: 200 });
      await expect( postTransaction(req, session) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postTransaction' for company number '${COMPANY_NUMBER}' with name '${OVERSEAS_NAME_MOCK}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `'postTransaction' for company number '${COMPANY_NUMBER}' with name '${OVERSEAS_NAME_MOCK}' returned no response`);
    });
  });

  describe('CLOSE Transaction', () => {

    test('Should successfully update (change status to close) transaction', async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce(TRANSACTION_CLOSED_RESPONSE);
      const response = await closeTransaction(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID);

      expect(mockMakeApiCallWithRetry).toBeCalledWith(
        serviceNameTransaction, fnNamePutTransaction, req, session, TRANSACTION_CLOSED_PARAMS
      );
      expect(response).toEqual(TRANSACTION_CLOSED_RESPONSE);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'putTransaction' for transaction id '${TRANSACTION_ID}'`);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'putTransaction' for transaction id '${TRANSACTION_ID}': ${JSON.stringify(TRANSACTION_CLOSED_RESPONSE)}`);
    });

    test(`Should throw an error when HTTP status code is 500`, async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce({ httpStatusCode: 500 });

      await expect( closeTransaction(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'putTransaction' for transaction id '${TRANSACTION_ID}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `'putTransaction' for transaction id '${TRANSACTION_ID}' returned HTTP status code 500`);
    });

    test(`Should throw an error when no response returned`, async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce(null);
      await expect( closeTransaction(req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'putTransaction' for transaction id '${TRANSACTION_ID}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `'putTransaction' for transaction id '${TRANSACTION_ID}' returned no response`);
    });
  });

  describe('GET Transaction', () => {

    test('Should successfully get transaction', async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_TRANSACTION_RESPONSE);
      const mockReq = { session } as Request;
      const response = await getTransaction(mockReq, MOCK_TRANSACTION_ID);

      expect(mockMakeApiCallWithRetry).toBeCalledWith(
        serviceNameTransaction, fnNameGetTransaction, mockReq, session, MOCK_TRANSACTION_ID
      );
      expect(response).toEqual(MOCK_GET_TRANSACTION_RESPONSE.resource);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(mockReq, `Calling 'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}'`);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(mockReq, `Response from 'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}': ${JSON.stringify(MOCK_GET_TRANSACTION_RESPONSE)}`);
    });

    test(`Should throw an error when HTTP response code is 500`, async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_ERROR_TRANSACTION_RESPONSE);
      await expect( getTransaction(req, MOCK_TRANSACTION_ID) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}' returned HTTP status code 500`);
    });

    test(`Should throw an error when response is not correct`, async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce( null );
      await expect( getTransaction(req, MOCK_TRANSACTION_ID) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(
        req,
        `'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}' returned incorrect response`
      );
    });

    test(`Should throw an error when response does not have httpStatusCode field`, async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce( { status: "any", body: "any" } );
      await expect( getTransaction(req, MOCK_TRANSACTION_ID) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(
        req,
        `'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}' returned incorrect response`
      );
    });

    test(`Should throw an error when no resource returned`, async () => {
      mockMakeApiCallWithRetry.mockResolvedValueOnce({ httpStatusCode: 200, any: "any" });
      await expect( getTransaction(req, MOCK_TRANSACTION_ID) ).rejects.toThrow(ERROR);
      expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}'`);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(
        req,
        `'getTransaction' for transaction id '${MOCK_TRANSACTION_ID}' returned no resource`
      );
    });
  });

});
