jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock("../../src/utils/logger");

import { authentication } from "../../src/controllers";
import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import * as config from "../../src/config";
import { NextFunction, Request, Response } from "express";
import { BENEFICIAL_OWNER_GOV_PAGE_HEADING, MESSAGE_ERROR, SERVICE_UNAVAILABLE  } from "../__mocks__/text.mock";
import { logger } from "../../src/utils/logger";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebug = logger.debug as jest.Mock;

describe("BENEFICIAL OWNER GOV controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test("renders the beneficial owner gov page", async () => {
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    });

    test("Should render the error page", async () => {
      mockLoggerDebug.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test("redirects to the managing-officer page", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.MANAGING_OFFICER_URL);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebug.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

  });
});
