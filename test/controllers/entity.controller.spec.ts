jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { ENTITY_URL } from "../../src/config";
import { getApplicationData, setApplicationData, prepareData } from "../../src/utils/application.data";
import { authentication } from "../../src/controllers";
import { ENTITY_OBJECT_MOCK } from '../__mocks__/session.mock';
import { BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT, ENTITY_PAGE_TITLE, ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("ENTITY controller", () => {

  test("renders the entity page on GET method", async () => {
    mockGetApplicationData.mockImplementation( () => getApplicationData );
    const resp = await request(app).get(ENTITY_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(ENTITY_PAGE_TITLE);
  });

  test("redirect the beneficial owner type page after a succesful post from ENTIRY page", async () => {

    mockPrepareData.mockImplementation( () => ENTITY_OBJECT_MOCK );
    mockSetApplicationData.mockImplementation( () => setApplicationData);
    const resp = await request(app).post(ENTITY_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT);
  });

  test("catch error when renders the entity page on GET method", async () => {
    mockGetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(ENTITY_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

  test("catch error when post data from ENTIRY page", async () => {
    mockSetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).post(ENTITY_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

});
