jest.mock("ioredis");
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/controllers/authentication.controller');

import { NextFunction, Request, Response } from "express";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import { CHECK_YOUR_ANSWERS_PAGE, CHECK_YOUR_ANSWERS_URL, CONFIRMATION_PAGE, CONFIRMATION_URL } from "../../src/config";
import { CHECK_YOUR_ANSWERS_PAGE_TITLE, FOUND_REDIRECT_TO, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";

import { authentication } from "../../src/controllers";
import { postTransaction } from "../../src/service/transaction.service";
import { createOverseasEntity } from "../../src/service/overseas.entities.service";
import { ERROR, OVERSEAS_ENTITY_ID, TRANSACTION } from "../__mocks__/session.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( { httpStatusCode: 200, resource: TRANSACTION } );

const mockOverseasEntity = createOverseasEntity as jest.Mock;
mockOverseasEntity.mockReturnValue( { id: OVERSEAS_ENTITY_ID } );

describe("GET tests", () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`renders the ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    const resp = await request(app).get(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(CHECK_YOUR_ANSWERS_PAGE_TITLE);
  });

  test(`redirect the ${CONFIRMATION_PAGE} page after a succesful post from ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${CONFIRMATION_URL}`);
  });

  test(`catch error when post data from ${CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
    mockOverseasEntity.mockImplementation( () => { throw ERROR; });
    const resp = await request(app).post(CHECK_YOUR_ANSWERS_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
