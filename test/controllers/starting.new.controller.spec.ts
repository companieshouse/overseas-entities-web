jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import {
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  STARTING_NEW_PAGE_TITLE,
} from "../__mocks__/text.mock";
import { ErrorMessages } from '../../src/validation/error.messages';

import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from "../../src/utils/logger";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Starting new controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.STARTING_NEW_PAGE} page`, async () => {
      const resp = await request(app).get(config.STARTING_NEW_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(STARTING_NEW_PAGE_TITLE);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.YOUR_FILINGS_PATH} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.STARTING_NEW_URL)
        .send({ continue_saved_application: 'yes' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.YOUR_FILINGS_PATH}`);
      expect(resp.header.location).toEqual(config.YOUR_FILINGS_PATH);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.SOLD_LAND_FILTER_URL} page when no is selected`, async () => {
      const soldLandFilterUrl = `${config.SOLD_LAND_FILTER_URL}?start=0`;
      const resp = await request(app)
        .post(config.STARTING_NEW_URL)
        .send({ continue_saved_application: 'no' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${soldLandFilterUrl}`);
      expect(resp.header.location).toEqual(soldLandFilterUrl);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.STARTING_NEW_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(STARTING_NEW_PAGE_TITLE);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_CONTINUE_SAVED_APPLICATION);
    });
  });
});
