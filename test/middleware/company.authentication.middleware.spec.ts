jest.mock("ioredis");
jest.mock("@companieshouse/web-security-node");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  getSessionRequestWithExtraData,
  getSessionRequestWithCompany,
  COMPANY_NUMBER
} from '../__mocks__/session.mock';
import { companyAuthentication } from "../../src/middleware/company.authentication.middleware";
import { authMiddleware } from "@companieshouse/web-security-node";
import { logger } from '../../src/utils/logger';
import { ANY_MESSAGE_ERROR } from '../__mocks__/text.mock';

jest.mock('../../src/utils/logger', () => {
  return {
    logger: { debugRequest: jest.fn(), infoRequest: jest.fn(), errorRequest: jest.fn() }
  };
});

const req = {} as Request;
const res = { locals: {}, redirect: jest.fn() as any } as Response;
const next = jest.fn();
const mockCompanyAuthMiddleware = authMiddleware as jest.Mock;
mockCompanyAuthMiddleware.mockImplementation(() => {
  return (req: Request, res: Response, next: NextFunction) => {
    return next();
  };
});

describe('Company Authentication middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    res.locals = {};
  });

  test("should call company authentication", () => {
    const mockLogInfoMsg = `Invoking company authentication with (${ COMPANY_NUMBER }) present in session`;
    req.session = getSessionRequestWithExtraData();

    companyAuthentication(req, res, next);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(mockCompanyAuthMiddleware).toBeCalled();
    expect(next).toBeCalled();
    expect(logger.errorRequest).not.toHaveBeenCalled();
  });

  test("should not call company authentication if already authenticated", () => {
    req.session = getSessionRequestWithCompany();

    companyAuthentication(req, res, next);

    expect(next).toBeCalled();
    expect(logger.errorRequest).not.toHaveBeenCalled();
  });

  test('should catch error when oeNumber is not present in session ', () => {
    req.session = undefined;

    companyAuthentication(req, res, next);

    expect(mockCompanyAuthMiddleware).not.toHaveBeenCalled();
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
