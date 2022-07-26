jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/navigation/check.condition');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { SOLD_LAND_FILTER_URL } from '../../../src/config';
import { logger } from "../../../src/utils/logger";
import { ANY_MESSAGE_ERROR } from '../../__mocks__/text.mock';

import { checkBeneficialOwnersStatementDetailsEntered, NavigationErrorMessage } from '../../../src/middleware/navigation/check.condition';
import { hasBeneficialOwnersStatement } from '../../../src/middleware/navigation/has.beneficial.owners.statement.middleware';

const mockCheckBeneficialOwnersStatementDetailsEntered = checkBeneficialOwnersStatementDetailsEntered as unknown as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.beneficial.owners.statement navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${SOLD_LAND_FILTER_URL} page and log message error ${NavigationErrorMessage}`, () => {
    mockCheckBeneficialOwnersStatementDetailsEntered.mockImplementationOnce( () => { return false; });
    hasBeneficialOwnersStatement(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SOLD_LAND_FILTER_URL);
  });

  test(`should not redirect and pass to the next middleware`, () => {
    mockCheckBeneficialOwnersStatementDetailsEntered.mockImplementationOnce( () => { return true; });
    hasBeneficialOwnersStatement(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", () => {
    mockCheckBeneficialOwnersStatementDetailsEntered.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    hasBeneficialOwnersStatement(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});
