jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { ENTITY_URL } from "../../src/config";
import { signedInCookie } from '../__mocks__/session.mock';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const ENTITY_PAGE_TITLE = "Tell us about the overseas entity";
const BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT = "Found. Redirecting to beneficial-owner-type";

describe("ENTITY controller", () => {
  test("renders the entity page on GET method", async () => {
    const resp = await request(app).get(ENTITY_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(ENTITY_PAGE_TITLE);
  });
  test("redirect the beneficial owner type page after a succesful post from ENTIRY page", async () => {
    const resp = await request(app).post(ENTITY_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT);
  });
});
