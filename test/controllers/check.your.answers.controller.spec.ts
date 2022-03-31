jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import { CHECK_YOUR_ANSWERS_URL } from "../../src/config";
import { CHECK_YOUR_ANSWERS_PAGE_TITLE } from "../__mocks__/text.mock";
import { authentication } from "../../src/controllers";
import { NextFunction, Request, Response } from "express";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("GET tests", () => {
  test("renders the check your answers page", async () => {
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
  });
});
