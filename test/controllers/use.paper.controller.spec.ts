jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock('../../src/middleware/navigation/has.sold.land.middleware');
jest.mock('../../src/utils/feature.flag');
jest.mock("../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe, beforeEach } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import { APPLY_PAPER_FORM_HEADING } from "../__mocks__/text.mock";

import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithTransactionIdAndSubmissionId } from "./../../src/utils/url";
import { authentication } from "../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { hasSoldLand } from "../../src/middleware/navigation/has.sold.land.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasSoldLandMiddleware = hasSoldLand as jest.Mock;
mockHasSoldLandMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithTransactionIdAndSubmissionId = getUrlWithTransactionIdAndSubmissionId as jest.Mock;

describe("USE PAPER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockGetUrlWithTransactionIdAndSubmissionId.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${config.USE_PAPER_PAGE} page when the REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValueOnce("");
      const resp = await request(app).get(config.USE_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(APPLY_PAPER_FORM_HEADING);
      expect(resp.text).toContain("enquiries@companieshouse.gov.uk");
      expect(resp.text).toContain("You must register the overseas entity on paper to keep this information protected.");
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithTransactionIdAndSubmissionId).not.toHaveBeenCalled();
    });

    test(`renders the ${config.USE_PAPER_PAGE} page when the REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValue("/some_url");
      const resp = await request(app).get(config.USE_PAPER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(APPLY_PAPER_FORM_HEADING);
      expect(resp.text).toContain("enquiries@companieshouse.gov.uk");
      expect(resp.text).toContain("You must register the overseas entity on paper to keep this information protected.");
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithTransactionIdAndSubmissionId).toHaveBeenCalledTimes(1);
    });
  });
});
