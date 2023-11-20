jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  CONTINUE_SAVED_FILING_PAGE_TITLE,
} from "../../__mocks__/text.mock";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { REMOVE_LANDING_PAGE_URL, REMOVE_SERVICE_NAME, UPDATE_SERVICE_NAME } from "../../../src/config";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Continue with saved filing controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE} page for the Update journey`, async () => {
      const resp = await request(app).get(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CONTINUE_SAVED_FILING_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE} page for the Remove journey`, async () => {
      const resp = await request(app).get(`${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}?${config.JOURNEY_QUERY_PARAM}=remove`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CONTINUE_SAVED_FILING_PAGE_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(REMOVE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST tests for update journey", () => {
    test(`redirects to the ${config.YOUR_FILINGS_PATH} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL)
        .send({ continue_saved_filing: 'yes' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.YOUR_FILINGS_PATH}`);
      expect(resp.header.location).toEqual(config.YOUR_FILINGS_PATH);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.SECURE_UPDATE_FILTER_PAGE} page when no is selected`, async () => {
      const secureUpdateFilterUrl = `${config.SECURE_UPDATE_FILTER_PAGE}?start=0`;
      const resp = await request(app)
        .post(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL)
        .send({ continue_saved_filing: 'no' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${secureUpdateFilterUrl}`);
      expect(resp.header.location).toEqual(secureUpdateFilterUrl);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CONTINUE_SAVED_FILING_PAGE_TITLE);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.UPDATE_SELECT_IF_CONTINUE_SAVED_FILING);
      expect(resp.text).toContain(UPDATE_SERVICE_NAME);
    });

  });

  describe("POST tests for Remove Journey", () => {

    test(`redirects to the ${config.YOUR_FILINGS_PATH} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL + '?journey=remove')
        .send({ continue_saved_filing: 'yes' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.YOUR_FILINGS_PATH}`);
      expect(resp.header.location).toEqual(config.YOUR_FILINGS_PATH);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE} page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL + '?journey=remove')
        .send({ continue_saved_filing: 'no' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
      expect(resp.header.location).toEqual(config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    // TODO Uncomment this test (which should pass) when a solution to handling validation on the 'remove' journey is implemented
    //
    // test("renders the current page with error message and correct page title for the Remove journey", async () => {
    //   const resp = await request(app).post(`${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}?${JOURNEY_QUERY_PARAM}=remove`);

    //   expect(resp.status).toEqual(200);
    //   expect(resp.text).toContain(CONTINUE_SAVED_FILING_PAGE_TITLE);
    //   expect(resp.text).toContain(PAGE_TITLE_ERROR);
    //   expect(resp.text).toContain(ErrorMessages.UPDATE_SELECT_IF_CONTINUE_SAVED_FILING);
    //   expect(resp.text).toContain(REMOVE_SERVICE_NAME);
    // });
  });
});
