jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock('../../src/utils/application.data');

import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK
} from "../__mocks__/session.mock";
import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../../src/app";
import * as config from "../../src/config";
import { ANY_MESSAGE_ERROR, BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import { authentication } from "../../src/controllers";
import { NextFunction, Request, Response } from "express";
import { getApplicationData, prepareData, setApplicationData } from "../../src/utils/application.data";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("BENEFICIAL OWNER STATEMENTS controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the beneficial owner statements page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain("allIdentifiedAllSupplied");
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("redirects to the beneficial owner type page", async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK);
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      const beneficialOwnerStatement = mockSetApplicationData.mock.calls[0][1];
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(beneficialOwnerStatement).toEqual(BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce(() =>  { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

  });
});
