jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../../src/config";
import app from "../../../src/app";
import { UPDATE_APPLY_PAPER_FORM_HEADING } from "../../__mocks__/text.mock";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe("UPDATE USE PAPER controller", () => {
  describe("GET tests", () => {
    test(`renders the ${config.USE_PAPER_PAGE} page`, async () => {
      const resp = await request(app).get(config.UPDATE_USE_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_APPLY_PAPER_FORM_HEADING);
    });
  });
});
