jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { authentication } from "../../src/controllers";
import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { BENEFICIAL_OWNER_OTHER_URL } from "../../src/config";
import { signedInCookie } from "../__mocks__/session.mock";
import { NextFunction, Request, Response } from "express";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const PAGE_TITLE = "Tell us about the corporate beneficial owner";

describe("BENEFICIAL OWNER OTHER controller", () => {
  test("renders the page", async () => {
    const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL).set("Cookie", signedInCookie);

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PAGE_TITLE);
  });
});
