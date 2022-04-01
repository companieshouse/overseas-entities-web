jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import * as config from "../../src/config";
import { BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING } from "../__mocks__/text.mock";
import { authentication } from "../../src/controllers";
import { NextFunction, Request, Response } from "express";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("BENEFICIAL OWNER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the beneficial owner type page", async () => {
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
    });
  });

  describe("POST tests", () => {
    test("redirects to the beneficial owner individual page", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
