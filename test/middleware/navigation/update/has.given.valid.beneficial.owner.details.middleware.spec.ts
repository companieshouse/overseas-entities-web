jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/middleware/navigation/check.condition');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
// import { SECURE_UPDATE_FILTER_PAGE, SECURE_UPDATE_FILTER_URL } from '../../../../src/config';
import { ANY_MESSAGE_ERROR } from '../../../__mocks__/text.mock';

import { checkHasGivenValidBOData } from '../../../../src/middleware/navigation/check.condition';
import { hasGivenValidBODetails } from '../../../../src/middleware/navigation/update/has.given.valid.beneficial.owner.details.middleware';

const mockCheckHasGivenValidBOData = checkHasGivenValidBOData as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.given.valid.beneficial.owner.details navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // test(`should redirect to ${SECURE_UPDATE_FILTER_PAGE} page and log message error ${NavigationErrorMessage} if check fails`, () => {
  //   mockCheckHasGivenValidBOData.mockImplementationOnce( () => { return false; });
  //   hasGivenValidBODetails(req, res, next);

  //   expect(next).not.toHaveBeenCalled;

  //   expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
  //   expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

  //   expect(res.redirect).toHaveBeenCalledTimes(1);
  //   expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
  // });

  test(`should not redirect and pass to the next middleware`, () => {
    mockCheckHasGivenValidBOData.mockImplementationOnce( () => { return true; });
    hasGivenValidBODetails(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", () => {
    mockCheckHasGivenValidBOData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    hasGivenValidBODetails(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
