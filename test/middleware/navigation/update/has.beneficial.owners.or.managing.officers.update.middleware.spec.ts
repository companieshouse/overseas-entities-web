jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/middleware/navigation/check.condition');
jest.mock('../../../../src/utils/application.data');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { SECURE_UPDATE_FILTER_URL } from '../../../../src/config';
import { logger } from "../../../../src/utils/logger";
import { ANY_MESSAGE_ERROR } from '../../../__mocks__/text.mock';

import { checkBOsOrMOsDetailsEnteredUpdate, NavigationErrorMessage } from '../../../../src/middleware/navigation/check.condition';
import { hasBOsOrMOsUpdate } from '../../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware';
import { APPLICATION_DATA_REGISTRATION_MOCK } from '../../../__mocks__/session.mock';
import { getApplicationData } from '../../../../src/utils/application.data';

const mockCheckBOsOrMOsDetailsEnteredUpdate = checkBOsOrMOsDetailsEnteredUpdate as unknown as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.beneficial.owners.or.managing.officers.update navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReturnValue(APPLICATION_DATA_REGISTRATION_MOCK);
  });

  test(`should redirect to ${SECURE_UPDATE_FILTER_URL} page and log message error ${NavigationErrorMessage} if update no change false`, () => {
    mockCheckBOsOrMOsDetailsEnteredUpdate.mockImplementationOnce( () => { return false; });

    hasBOsOrMOsUpdate(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
  });

  test(`should redirect to ${SECURE_UPDATE_FILTER_URL} page and log message error ${NavigationErrorMessage}`, () => {
    mockCheckBOsOrMOsDetailsEnteredUpdate.mockImplementationOnce( () => { return false; });
    hasBOsOrMOsUpdate(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
  });

  test(`should not redirect and pass to the next middleware`, () => {
    mockCheckBOsOrMOsDetailsEnteredUpdate.mockImplementationOnce( () => { return true; });
    hasBOsOrMOsUpdate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", () => {
    mockCheckBOsOrMOsDetailsEnteredUpdate.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    hasBOsOrMOsUpdate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test(`should not redirect to ${SECURE_UPDATE_FILTER_URL} page if update no change is true`, () => {
    mockCheckBOsOrMOsDetailsEnteredUpdate.mockImplementationOnce( () => { return false; });
    mockGetApplicationData.mockReturnValueOnce({
      update: {
        no_change: true
      }
    });
    hasBOsOrMOsUpdate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});
