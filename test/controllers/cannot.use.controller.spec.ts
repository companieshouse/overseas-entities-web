jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');

import { NextFunction, Request, Response } from "express";
import { expect, test, describe, jest } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import * as config from "../../src/config";

import { authentication } from "../../src/middleware/authentication.middleware";
import { CANNOT_USE_SERVICE_HEADING } from "../__mocks__/text.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("CANNOT USE controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.CANNOT_USE_PAGE} page`, async () => {
      const resp = await request(app).get(config.CANNOT_USE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
    });
  });
});
