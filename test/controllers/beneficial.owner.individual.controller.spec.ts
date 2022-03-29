jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { BENEFICIAL_OWNER_INDIVIDUAL_URL } from "../../src/config";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const BENEFICIAL_OWNER_INDIVIDUAL_PAGE_TITLE = "Tell us about the individual beneficial owner";

describe("BENEFICIAL OWNER INDIVIDUAL controller", () => {
  test("renders the beneficial owner individual page", async () => {
    const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_TITLE);
  });
});
