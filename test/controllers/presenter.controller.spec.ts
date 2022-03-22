jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { PRESENTER_URL } from "../../src/config";
import { signedInCookie } from '../__mocks__/session.mock';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const PRESENTER_PAGE_TITLE = "Tell us about yourself";

describe("PRESENTER controller", () => {
  test("renders the presenter page", async () => {
    const resp = await request(app).get(PRESENTER_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
  });
});
