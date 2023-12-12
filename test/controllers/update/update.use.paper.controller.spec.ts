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
import { REMOVE_APPLY_PAPER_FORM_HEADING, UPDATE_APPLY_PAPER_FORM_HEADING } from "../../__mocks__/text.mock";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { JOURNEY_REMOVE_QUERY_PARAM, UPDATE_USE_PAPER_URL, SECURE_UPDATE_FILTER_URL } from "../../../src/config";

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
      expect(resp.text).toContain(config.UPDATE_SERVICE_NAME);
      expect(resp.text).toContain("You must register the overseas entity on paper to keep this information protected.");
    });

    test(`renders the ${config.USE_PAPER_PAGE} page for remove`, async () => {
      const resp = await request(app).get(`${UPDATE_USE_PAPER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_APPLY_PAPER_FORM_HEADING);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
      expect(resp.text).toContain("You must submit this filing on paper to keep this information protected.");
      // back link
      expect(resp.text).toContain(`${SECURE_UPDATE_FILTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);
    });
  });
});
