jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/utils/application.data');

import { describe, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
import { SECURE_UPDATE_FILTER_URL } from '../../../../src/config';

import { NavigationErrorMessage } from '../../../../src/middleware/navigation/check.condition';
import { isInChangeJourney } from '../../../../src/middleware/navigation/update/is.in.change.journey.middleware';
import { getApplicationData } from '../../../../src/utils/application.data';
import { ApplicationData } from '../../../../src/model';

const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("is in change journey middleware", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
  });

  test('when in no change journey, should redirect to SECURE_UPDATE_FILTER_URL page and log error message', async () => {
    mockGetApplicationData.mockReturnValueOnce({ update: { no_change: true } } as ApplicationData);

    await isInChangeJourney(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
  });

  test('when in change journey, should not redirect and pass to the next middleware', async () => {
    mockGetApplicationData.mockReturnValueOnce({ update: { no_change: false } } as ApplicationData);

    await isInChangeJourney(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test('when an error is thrown, next is called with the error as an argument', async () => {
    const error = new Error('Error message');
    mockGetApplicationData.mockImplementationOnce(() => { throw error; });

    await isInChangeJourney(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });
});
