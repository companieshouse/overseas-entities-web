jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/middleware/navigation/check.condition');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
import { OVERSEAS_ENTITY_QUERY_URL } from '../../../../src/config';
import { ANY_MESSAGE_ERROR } from '../../../__mocks__/text.mock';

import { checkUpdateDueDiligenceDetailsEntered, NavigationErrorMessage } from '../../../../src/middleware/navigation/check.condition';
import { hasDueDiligenceDetails } from '../../../../src/middleware/navigation/update/has.due.diligence.details.middleware';

const mockCheckUpdateDueDiligenceDetailsEntered = checkUpdateDueDiligenceDetailsEntered as unknown as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.due.diligence.detials navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${OVERSEAS_ENTITY_QUERY_URL} page and log message error ${NavigationErrorMessage}`, async () => {
    mockCheckUpdateDueDiligenceDetailsEntered.mockImplementationOnce( () => { return false; });
    await hasDueDiligenceDetails(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`should not redirect and pass to the next middleware`, async () => {
    mockCheckUpdateDueDiligenceDetailsEntered.mockImplementationOnce( () => { return true; });
    await hasDueDiligenceDetails(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", async () => {
    mockCheckUpdateDueDiligenceDetailsEntered.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    await hasDueDiligenceDetails(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
