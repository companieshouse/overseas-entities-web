jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { MANAGING_OFFICER_CORPORATE_URL } from "../../src/config";
import { MANAGING_OFFICER_CORPORATE_PAGE_TITLE } from "../__mocks__/text.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("MANAGING_OFFICER CORPORATE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the managing officer corporate page", async () => {
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
    });
  });
});
