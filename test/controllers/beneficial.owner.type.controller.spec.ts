jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import { describe, expect, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { BENEFICIAL_OWNER_TYPE_URL, ENTITY_URL } from "../../src/config";
import { getApplicationData, prepareData, setApplicationData } from '../../src/utils/application.data';
import { ANY_MESSAGE_ERROR, BENEFICIAL_OWNER_TYPE_PAGE_HEADING, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { APPLICATION_DATA_MOCK, BENEFICIAL_OWNER_TYPE_OBJECT_MOCK } from '../__mocks__/session.mock';
import { beneficialOwnerTypeType } from '../../src/model';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("BENEFICIAL OWNER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the beneficial owner type page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(ENTITY_URL);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("redirects to the next page", async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/next-page");
    });

    test("adds data to the session", async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_TYPE_OBJECT_MOCK );
      const resp = await request(app).post(BENEFICIAL_OWNER_TYPE_URL);

      expect(mockSetApplicationData.mock.calls[0][1]).toEqual(BENEFICIAL_OWNER_TYPE_OBJECT_MOCK);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(beneficialOwnerTypeType.BeneficialOwnerTypeKey);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/next-page");
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
