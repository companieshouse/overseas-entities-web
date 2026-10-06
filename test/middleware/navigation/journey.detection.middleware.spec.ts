jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');

import { Request, Response } from 'express';
import { logger } from "../../../src/utils/logger";
import { JourneyType } from '../../../src/config';
import { IsRemoveKey } from "../../../src/model/data.types.model";
import { getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { journeyDetectionMiddleware } from '../../../src/middleware/navigation/journey.detection.middleware';

const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const TRANSACTION_ID = "abc-123";
const SUBMISSION_ID = "xyz-789";

const next = jest.fn();

const res = {
  locals: {}
} as Response;

const req = {
  query: {},
  params: {
    transactionId: TRANSACTION_ID,
    submissionId: SUBMISSION_ID,
  },
} as Request;

describe("journey detection middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should save the Update journey value "update" in res.locals`, async () => {
    const requestUrl = `/update-an-overseas-entity/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/update-beneficial-owner-type`;
    req.originalUrl = requestUrl;
    req.url = requestUrl;
    mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
    await journeyDetectionMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(res.locals.journey).toBe(JourneyType.update);
  });

  test(`should save the Remove journey value "remove" in res.locals when the "is_remove" key is set to "true" in application data`, async () => {
    const requestUrl = `/update-an-overseas-entity/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/update-beneficial-owner-type`;
    req.originalUrl = requestUrl;
    req.url = requestUrl;
    mockGetApplicationData.mockReturnValueOnce({
      ...APPLICATION_DATA_MOCK,
      [IsRemoveKey]: true
    });
    await journeyDetectionMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(res.locals.journey).toBe(JourneyType.remove);
  });

  test(`should save the Remove journey value "remove" in res.locals when specified in the URL query`, async () => {
    const requestUrl = `/update-an-overseas-entity/remove/remove-sold-all-land-filter?journey=remove`;
    req.originalUrl = requestUrl;
    req.url = requestUrl;
    mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
    await journeyDetectionMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(res.locals.journey).toBe(JourneyType.remove);
  });

  test(`should save the Registration journey value "register" in res.locals as the default`, async () => {
    const requestUrl = `/register-an-overseas-entity/transaction/${TRANSACTION_ID}/submission/${SUBMISSION_ID}/secure-register-filter`;
    req.originalUrl = requestUrl;
    req.url = requestUrl;
    mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
    await journeyDetectionMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(res.locals.journey).toBe(JourneyType.register);
  });
});
