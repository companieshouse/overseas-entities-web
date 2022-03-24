jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { MANAGING_OFFICER_URL } from "../../src/config";
import { signedInCookie } from '../__mocks__/session.mock';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const MANAGING_OFFICER_PAGE_TITLE = "Tell us about the managing officer";

describe("MANAGING_OFFICER controller", () => {
  test("renders the managing officer page", async () => {
    const resp = await request(app).get(MANAGING_OFFICER_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(MANAGING_OFFICER_PAGE_TITLE);
  });
});
