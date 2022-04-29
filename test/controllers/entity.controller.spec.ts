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
import { APPLICATION_DATA_MOCK, ENTITY_OBJECT_MOCK, ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS } from '../__mocks__/session.mock';
import { BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT, ENTITY_PAGE_TITLE, ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { HasSamePrincipalAddressKey } from '../../src/model/data.types.model';

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

  test("renders the entity page on GET method with session data populated", async () => {
    mockGetApplicationData.mockImplementation( () => APPLICATION_DATA_MOCK );
    const resp = await request(app).get(ENTITY_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(ENTITY_PAGE_TITLE);
    expect(resp.text).toContain(ENTITY_OBJECT_MOCK.legal_form);
  });

  test("redirect the beneficial owner type page after a successful post from ENTITY page", async () => {

    mockPrepareData.mockImplementation( () => ENTITY_OBJECT_MOCK );
    mockSetApplicationData.mockImplementation( () => setApplicationData);
    const resp = await request(app).post(ENTITY_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);
  });

  test("redirect to the next page page after a successful post from ENTITY page with service address data", async () => {
    mockPrepareData.mockImplementation( () => ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS );
    mockSetApplicationData.mockImplementation( () => setApplicationData);
    const resp = await request(app).post(ENTITY_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);
  });

  test("redirect to the next page page after a successful post from ENTITY page without the selection option", async () => {
    mockPrepareData.mockImplementation( () =>  { return { ...ENTITY_OBJECT_MOCK, [HasSamePrincipalAddressKey]: "" }; } );
    mockSetApplicationData.mockImplementation( () => setApplicationData);
    const resp = await request(app).post(ENTITY_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);
  });

  test("catch error when renders the entity page on GET method", async () => {
    mockGetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(ENTITY_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

  test("catch error when post data from ENTITY page", async () => {
    mockSetApplicationData.mockImplementation( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).post(ENTITY_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

});
