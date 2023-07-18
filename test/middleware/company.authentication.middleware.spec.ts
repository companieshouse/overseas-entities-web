jest.mock("ioredis");
jest.mock('../../src/service/transaction.service');
jest.mock("../../src/utils/logger");
jest.mock("@companieshouse/web-security-node");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { Params } from 'express-serve-static-core';
import {
  getSessionRequestWithExtraData,
  COMPANY_NUMBER,
  getSessionRequestWithPermission,
  APPLICATION_DATA_REGISTRATION_MOCK
} from '../__mocks__/session.mock';
import { companyAuthentication } from "../../src/middleware/company.authentication.middleware";
import { getTransaction } from "../../src/service/transaction.service";
import { authMiddleware } from "@companieshouse/web-security-node";
import { logger } from '../../src/utils/logger';
import { ANY_MESSAGE_ERROR } from '../__mocks__/text.mock';
import { MOCK_GET_UPDATE_TRANSACTION_RESPONSE } from '../__mocks__/transaction.mock';

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

let req = {} as Request;
const transactionId = "123";
const res = { locals: {}, redirect: jest.fn() as any } as Response;
const next = jest.fn();
const mockCompanyAuthMiddleware = authMiddleware as jest.Mock;
mockCompanyAuthMiddleware.mockImplementation(() => {
  return (req: Request, res: Response, next: NextFunction) => {
    return next();
  };
});

const mockGetTransactionService = getTransaction as jest.Mock;

describe('Company Authentication middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    res.locals = {};
  });

  test("should call company authentication for update journey", async () => {
    const mockLogInfoMsg = `Invoking company authentication with (${ COMPANY_NUMBER }) present in session`;
    req = {
      session: getSessionRequestWithExtraData(),
      headers: {},
      route: '',
      method: '',
      path: '/update-an-overseas-entity/presenter',
      body: {}
    } as Request;

    await companyAuthentication(req, res, next);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(mockCompanyAuthMiddleware).toBeCalled();
    expect(logger.errorRequest).not.toHaveBeenCalled();
  });

  test("should call company authentication for resume journey with no session data", async () => {
    const mockLogInfoMsg = `Invoking company authentication with (OE111129) present in session`;
    req = {
      session: getSessionRequestWithPermission(),
      params: {
        transactionId: transactionId,
      } as Params,
      headers: {},
      route: '',
      method: '',
      path: '/user/transactions/' + transactionId + '/resume',
      originalUrl: '/user/transactions/' + transactionId + '/resume',
      body: {}
    } as Request;

    mockGetTransactionService.mockReturnValueOnce( MOCK_GET_UPDATE_TRANSACTION_RESPONSE.resource );

    await companyAuthentication(req, res, next);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(mockCompanyAuthMiddleware).toBeCalled();
    expect(mockLoggerErrorRequest).not.toHaveBeenCalled();
  });

  test("should call company authentication for resume journey with another OE in session data", async () => {
    const mockLogInfoMsg = `Invoking company authentication with (OE111129) present in session`;
    req = {
      session: getSessionRequestWithExtraData(),
      params: {
        transactionId: transactionId,
      } as Params,
      headers: {},
      route: '',
      method: '',
      path: '/user/transactions/' + transactionId + '/resume',
      originalUrl: '/user/transactions/' + transactionId + '/resume',
      body: {}
    } as Request;

    mockGetTransactionService.mockReturnValueOnce( MOCK_GET_UPDATE_TRANSACTION_RESPONSE.resource );

    await companyAuthentication(req, res, next);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(mockCompanyAuthMiddleware).toBeCalled();
    expect(mockLoggerErrorRequest).not.toHaveBeenCalled();
  });

  test("should catch error if transactionId is undefined", async () => {
    req = {
      session: getSessionRequestWithExtraData(),
      params: {},
      headers: {},
      route: '',
      method: '',
      path: '/user/transactions//resume',
      body: {}
    } as Request;

    await companyAuthentication(req, res, next);

    expect(mockLoggerErrorRequest).toHaveBeenCalled();
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
  });

  test('should catch error when appData is not present in session for update journey', async () => {
    req = {
      session: getSessionRequestWithPermission(),
      headers: {},
      route: '',
      method: '',
      path: '/update-an-overseas-entity/presenter',
      body: {}
    } as Request;

    await companyAuthentication(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledTimes(2);
  });

  test('should catch error when appData is not present in session for update journey', async () => {
    req = {
      session: getSessionRequestWithExtraData(APPLICATION_DATA_REGISTRATION_MOCK),
      headers: {},
      route: '',
      method: '',
      path: '/update-an-overseas-entity/presenter',
      body: {}
    } as Request;

    await companyAuthentication(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledTimes(2);
  });

  test('should call next(err) after catching error', () => {
    const error = new Error(ANY_MESSAGE_ERROR);
    mockCompanyAuthMiddleware.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
    req.session = getSessionRequestWithExtraData();

    companyAuthentication(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);
  });
});
