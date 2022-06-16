jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');

import request from "supertest";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";

import app from "../../src/app";
import { CONFIRMATION_URL } from "../../src/config";
import { CONFIRMATION_PAGE_TITLE } from "../__mocks__/text.mock";
import { deleteApplicationData, getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_MOCK, getSessionRequestWithExtraData, TRANSACTION_ID } from "../__mocks__/session.mock";
import { get } from "../../src/controllers/confirmation.controller";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockDeleteApplicationData = deleteApplicationData as jest.Mock;

const req = {} as Request;
const res = { render: jest.fn() as any } as Response;

describe("Confirmation controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the confirmation page", async () => {
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    const resp = await request(app).get(CONFIRMATION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CONFIRMATION_PAGE_TITLE);
    expect(resp.text).toContain(TRANSACTION_ID);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });

  test("should test that deleteApplicationData does the work", () => {
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    req.session = getSessionRequestWithExtraData();

    get(req, res);

    const appData = getApplicationData(req.session);

    expect(appData).toBeFalsy; // Check extra data deleted
    expect(res.render).toHaveBeenCalledTimes(1);
    expect(mockDeleteApplicationData).toHaveBeenCalledTimes(1);
  });
});
