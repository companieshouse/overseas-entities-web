jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/application.data");

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, TRUST_INFO_PAGE_TITLE } from "../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from '../__mocks__/session.mock';
import * as config from "../../src/config";
import { getApplicationData } from "../../src/utils/application.data";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("TRUST INFORMATION controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.TRUST_INFO_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.TRUST_INFO_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(TRUST_INFO_PAGE_TITLE);
    });
  });

  test("catch error when rendering the page", async () => {
    mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(config.TRUST_INFO_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.TRUST_INFO_PAGE} page`, async () => {
      const resp = await request(app).post(config.TRUST_INFO_URL);

      expect(resp.status).toEqual(302); // TODO update this test when POST endpoint implemented
    });
  });

});
