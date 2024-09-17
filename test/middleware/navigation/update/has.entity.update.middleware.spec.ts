jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/middleware/navigation/check.condition');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
import { UPDATE_LANDING_URL } from '../../../../src/config';
import { ANY_MESSAGE_ERROR } from '../../../__mocks__/text.mock';

import { checkEntityUpdateDetailsEntered, NavigationErrorMessage } from '../../../../src/middleware/navigation/check.condition';
import { hasEntityUpdateDetails } from '../../../../src/middleware/navigation/update/has.entity.update.middleware';

const mockCheckEntityUpdateDetailsEntered = checkEntityUpdateDetailsEntered as unknown as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.entity.update navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${UPDATE_LANDING_URL} page and log message error ${NavigationErrorMessage}`, async () => {
    mockCheckEntityUpdateDetailsEntered.mockImplementationOnce( () => { return false; });
    await hasEntityUpdateDetails(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(UPDATE_LANDING_URL);
  });

  test(`should not redirect and pass to the next middleware`, async () => {
    mockCheckEntityUpdateDetailsEntered.mockImplementationOnce( () => { return true; });
    await hasEntityUpdateDetails(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", async () => {
    mockCheckEntityUpdateDetailsEntered.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    await hasEntityUpdateDetails(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
