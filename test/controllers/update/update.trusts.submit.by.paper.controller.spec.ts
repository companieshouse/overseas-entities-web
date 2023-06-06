jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { expect, test, describe, jest } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";
import * as config from "../../../src/config";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE_HEADING } from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe("Update trusts submit by paper controller", () => {
  describe("GET tests", () => {
    test("renders the trusts submit by paper page", async () => {
      const resp = await request(app).get(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_TRUSTS_SUBMIT_BY_PAPER_PAGE_HEADING);
    });
  });
});
