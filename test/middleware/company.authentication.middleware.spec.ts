jest.mock("ioredis");
jest.mock('../../src/service/transaction.service');
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/url");
jest.mock("@companieshouse/web-security-node");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { Params } from 'express-serve-static-core';
import {
  getSessionRequestWithExtraData,
  COMPANY_NUMBER,
  getSessionRequestWithPermission,
  APPLICATION_DATA_REGISTRATION_MOCK,
  APPLICATION_DATA_MOCK
} from '../__mocks__/session.mock';
import { companyAuthentication } from "../../src/middleware/company.authentication.middleware";
import { getTransaction } from "../../src/service/transaction.service";
import { authMiddleware } from "@companieshouse/web-security-node";
import { logger } from '../../src/utils/logger';
import { ANY_MESSAGE_ERROR } from '../__mocks__/text.mock';
import { MOCK_GET_UPDATE_TRANSACTION_RESPONSE } from '../__mocks__/transaction.mock';
import { isRemoveJourney } from "../../src/utils/url";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockIsRemoveJourney = isRemoveJourney as jest.Mock;

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

  test(`should check that the journey is a remove journey`, async () => {
    const mockLogInfoMsg = `Invoking company authentication with (${ COMPANY_NUMBER }) present in session`;
    req = {
      session: getSessionRequestWithExtraData(),
      headers: {},
      route: '',
      method: '',
      path: '/update-an-overseas-entity/presenter',
      body: {},
      query: {}
    } as Request;

    await companyAuthentication(req, res, next);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(mockIsRemoveJourney).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).not.toHaveBeenCalled();
  });

  test("should call company authentication when no company number in session", async () => {
    const appData = { ...APPLICATION_DATA_MOCK };
    appData.entity_number = undefined;
    req = {
      session: getSessionRequestWithExtraData(appData),
      headers: {},
      route: '',
      method: '',
      path: '/update-an-overseas-entity/presenter',
      body: {}
    } as Request;

    await companyAuthentication(req, res, next);

    expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerErrorRequest).toHaveBeenCalledWith(req, "No entity number to authenticate against -- redirecting to start of Journey: /update-an-overseas-entity");
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

    const transactionResponse = { ...MOCK_GET_UPDATE_TRANSACTION_RESPONSE.resource };
    mockGetTransactionService.mockReturnValueOnce(transactionResponse);

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

    const transactionResponse = { ...MOCK_GET_UPDATE_TRANSACTION_RESPONSE.resource };
    mockGetTransactionService.mockReturnValueOnce(transactionResponse);

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

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
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

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);
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

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);
  });

  test('should call next(err) after catching error', async () => {
    const error = new Error(ANY_MESSAGE_ERROR);
    mockCompanyAuthMiddleware.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
    req.session = getSessionRequestWithExtraData();

    await companyAuthentication(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);
  });

  test("should log error if no company number in transaction", async () => {
    req = {
      session: getSessionRequestWithExtraData(),
      params: { transactionId: "123" } as Params,
      headers: {},
      route: '',
      method: '',
      path: '/user/transactions//resume',
      body: {}
    } as Request;

    const transactionResponse = { ...MOCK_GET_UPDATE_TRANSACTION_RESPONSE.resource };
    transactionResponse.companyNumber = undefined;

    mockGetTransactionService.mockReturnValueOnce(transactionResponse);

    await companyAuthentication(req, res, next);

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
    expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerErrorRequest).toHaveBeenCalledWith(req, Error("No company number in transaction to resume"));
  });
});
