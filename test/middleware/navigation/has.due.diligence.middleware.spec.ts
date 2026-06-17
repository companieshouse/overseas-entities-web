jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/navigation/check.condition');

import { Request, Response } from 'express';
import { logger } from "../../../src/utils/logger";
import { hasDueDiligence } from '../../../src/middleware/navigation/has.due.diligence.middleware';
import { ANY_MESSAGE_ERROR } from '../../__mocks__/text.mock';
import { SOLD_LAND_FILTER_URL } from '../../../src/config';
import { checkDueDiligenceDetailsEntered, NavigationErrorMessage } from '../../../src/middleware/navigation/check.condition';

const mockCheckDueDiligenceDetailsEntered = checkDueDiligenceDetailsEntered as unknown as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.DueDiligence navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${SOLD_LAND_FILTER_URL} page and log message error ${NavigationErrorMessage} when REDIS_flag is OFF`, async () => {
    mockCheckDueDiligenceDetailsEntered.mockImplementationOnce( () => { return false; });
    await hasDueDiligence(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SOLD_LAND_FILTER_URL);
  });

  test(`should not redirect and pass to the next middleware`, async () => {
    mockCheckDueDiligenceDetailsEntered.mockImplementationOnce( () => { return true; });
    await hasDueDiligence(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", async () => {
    mockCheckDueDiligenceDetailsEntered.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    await hasDueDiligence(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});
