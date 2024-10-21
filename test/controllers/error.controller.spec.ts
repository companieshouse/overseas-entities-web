jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock("../../src/controllers/landing.controller");
jest.mock("../../src/controllers/update/update.landing.controller");
jest.mock("../../src/middleware/service.availability.middleware");
jest.mock("../../src/controllers/update/update.continue.saved.filing.controller");
jest.mock("../../src/middleware/authentication.middleware");

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import request from "supertest";
import { CsrfError } from '@companieshouse/web-security-node';
import app from "../../src/app";
import { logger } from "../../src/utils/logger";
import * as landingController from "../../src/controllers/landing.controller";
import * as updateLandingController from "../../src/controllers/update/update.landing.controller";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import * as continueSavedFilingController from "../../src/controllers/update/update.continue.saved.filing.controller";
import * as config from "../../src/config";
import { CSRF_ERROR_PAGE_HEADING, CSRF_ERROR_PAGE_TEXT, CSRF_TOKEN_ERROR, EXPECTED_TEXT, INCORRECT_URL, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { NextFunction } from 'express';
import { authentication } from '../../src/middleware/authentication.middleware';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());
const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockGet = landingController.get as jest.Mock;
const mockUpdateLandingControllerGet = updateLandingController.get as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());
const mockContinueSavedFilingControllerGet = continueSavedFilingController.get as jest.Mock;

describe("ERROR controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("CSRF error page tests", () => {

    test("Should render the CSRF error page", async () => {
      mockGet.mockImplementationOnce(() => { throw new CsrfError(CSRF_TOKEN_ERROR); });
      const response = await request(app).get(config.LANDING_URL);
      expect(response.status).toEqual(403);
      expect(response.text).toContain(CSRF_ERROR_PAGE_HEADING);
      expect(response.text).toContain(CSRF_ERROR_PAGE_TEXT);
      expect(response.text).toContain(config.SERVICE_NAME);
    });

    test("Should render the CSRF error page on update journey", async () => {
      mockUpdateLandingControllerGet.mockImplementationOnce(() => { throw new CsrfError(CSRF_TOKEN_ERROR); });
      const response = await request(app).get(config.UPDATE_LANDING_URL);
      expect(response.status).toEqual(403);
      expect(response.text).toContain(CSRF_ERROR_PAGE_HEADING);
      expect(response.text).toContain(CSRF_ERROR_PAGE_TEXT);
      expect(response.text).toContain(config.UPDATE_SERVICE_NAME);
    });

    test.skip("Should render the CSRF error page on remove journey", async () => {
      mockContinueSavedFilingControllerGet.mockImplementationOnce(() => { throw new CsrfError(CSRF_TOKEN_ERROR); });
      const response = await request(app).get(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL + config.JOURNEY_REMOVE_QUERY_PARAM);
      expect(response.status).toEqual(403);
      expect(response.text).toContain(CSRF_ERROR_PAGE_HEADING);
      expect(response.text).toContain(CSRF_ERROR_PAGE_TEXT);
      expect(response.text).toContain(config.REMOVE_SERVICE_NAME);
    });
  });

  test("Should return page not found screen if page url is not recognised", async () => {
    const response = await request(app).get(INCORRECT_URL);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.status).toEqual(404);
    expect(response.text).toContain(config.LANDING_PAGE_URL);
  });

  test("Should render the error page", async () => {
    mockGet.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
    const response = await request(app).get(config.LANDING_URL);

    expect(response.status).toEqual(500);
    expect(response.text).toContain(SERVICE_UNAVAILABLE);
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(MESSAGE_ERROR);
  });

});
