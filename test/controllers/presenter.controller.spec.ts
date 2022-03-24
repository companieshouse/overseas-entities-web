jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { PRESENTER_URL } from "../../src/config";
import { signedInCookie } from '../__mocks__/session.mock';
import { getApplicationData, setApplicationData } from "../../src/utils/application.data";
import { ANY_MESSAGE_ERROR, ENTITY_PAGE_REDIRECT, PRESENTER_PAGE_TITLE, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';


const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("PRESENTER controller", () => {

  test("renders the presenter page", async () => {
    mockGetApplicationData.mockImplementation( () => getApplicationData );
    const resp = await request(app).get(PRESENTER_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(PRESENTER_PAGE_TITLE);
  });

  test("redirect the entity page after a succesful post from presenter page", async () => {
    mockSetApplicationData.mockImplementation( () => setApplicationData);
    const resp = await request(app).post(PRESENTER_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(ENTITY_PAGE_REDIRECT);
  });

  test("catch error when renders the presenter page", async () => {
    mockGetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(PRESENTER_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

  test("catch error when post data from presenter page", async () => {
    mockSetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).post(PRESENTER_URL).set("Cookie", signedInCookie);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
