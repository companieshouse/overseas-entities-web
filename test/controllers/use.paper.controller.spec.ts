jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.sold.land.middleware');

import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import { APPLY_PAPER_FORM_HEADING } from "../__mocks__/text.mock";

import { authentication } from "../../src/middleware/authentication.middleware";
import { hasSoldLand } from "../../src/middleware/navigation/has.sold.land.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasSoldLandMiddleware = hasSoldLand as jest.Mock;
mockHasSoldLandMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("USE PAPER controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.USE_PAPER_PAGE} page`, async () => {
      const resp = await request(app).get(config.USE_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(APPLY_PAPER_FORM_HEADING);
      expect(resp.text).toContain("enquiries@companieshouse.gov.uk");
    });
  });
});
