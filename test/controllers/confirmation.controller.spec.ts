jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');

import request from "supertest";
import { describe, expect, jest, test } from "@jest/globals";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";

import app from "../../src/app";
import { CONFIRMATION_URL } from "../../src/config";
import { CONFIRMATION_PAGE_TITLE } from "../__mocks__/text.mock";
import { getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK, TRANSACTION_ID } from "../__mocks__/session.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Confirmation controller tests", () => {
  test("renders the confirmation page", async () => {
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(TRANSACTION_ID);
  });
});
