jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');

import request from "supertest";
import { describe, expect, jest, test } from "@jest/globals";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";
import app from "../../src/app";
import { CONFIRMATION_URL } from "../../src/config";
import { CONFIRMATION_PAGE_TITLE } from "../__mocks__/text.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Confirmation controller tests", () => {
  test("renders the confirmation page", async () => {
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
  });
});
