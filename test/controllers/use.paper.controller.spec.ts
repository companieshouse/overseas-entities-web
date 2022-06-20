jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');

import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import { CANNOT_USE_SERVICE_HEADING } from "../__mocks__/text.mock";

import { authentication } from "../../src/middleware/authentication.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("USE PAPER controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.USE_PAPER_URL} page`, async () => {
      const resp = await request(app).get(config.USE_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
    });
  });
});
