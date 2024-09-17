jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/feature.flag');
jest.mock("../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { expect, test, describe, jest, beforeEach } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import * as config from "../../src/config";

import { authentication } from "../../src/middleware/authentication.middleware";
import { CANNOT_USE_SERVICE_HEADING } from "../__mocks__/text.mock";

import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithTransactionIdAndSubmissionId } from "./../../src/utils/url";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithTransactionIdAndSubmissionId = getUrlWithTransactionIdAndSubmissionId as jest.Mock;

describe("CANNOT USE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockGetUrlWithTransactionIdAndSubmissionId.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${config.CANNOT_USE_PAGE} page when the REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValueOnce("");
      const resp = await request(app).get(config.CANNOT_USE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithTransactionIdAndSubmissionId).not.toHaveBeenCalled();
    });

    test(`renders the ${config.CANNOT_USE_PAGE} page when the REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValueOnce("/some_url");
      const resp = await request(app).get(config.CANNOT_USE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithTransactionIdAndSubmissionId).toHaveBeenCalledTimes(1);
    });

  });
});
