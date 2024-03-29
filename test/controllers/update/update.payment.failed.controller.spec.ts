jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { expect, jest, test } from "@jest/globals";
import request from "supertest";

import {
  PAYMENT_FAILED_PAGE,
  UPDATE_PAYMENT_FAILED_URL,
  YOUR_FILINGS_PATH
} from "../../../src/config";
import app from "../../../src/app";
import { PAYMENT_FAILED_PAGE_HEADING } from "../../__mocks__/text.mock";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
describe("Update payment failed controller tests", () => {

  test(`renders the ${PAYMENT_FAILED_PAGE} page`, async () => {
    const resp = await request(app).get(UPDATE_PAYMENT_FAILED_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PAYMENT_FAILED_PAGE_HEADING);
    expect(resp.text).toContain(YOUR_FILINGS_PATH);
  });
});
