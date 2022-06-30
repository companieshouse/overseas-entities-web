jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/application.data");
jest.mock('../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, TRUST_INFO_PAGE_TITLE } from "../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK, TRUST_DATA, TRUSTS_SUBMIT, TRUSTS_ADD_MORE } from '../__mocks__/session.mock';
import * as config from "../../src/config";
import { getApplicationData, setApplicationData, prepareData } from "../../src/utils/application.data";
import { hasBOsOrMOs } from "../../src/middleware/navigation/has.beneficial.owners.or.managing.officers.middleware";

const mockHasBOsOrMOsMiddleware = hasBOsOrMOs as jest.Mock;
mockHasBOsOrMOsMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

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

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.TRUST_INFO_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => TRUST_DATA );
      const resp = await request(app).post(config.TRUST_INFO_URL).send(TRUSTS_SUBMIT);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.CHECK_YOUR_ANSWERS_PAGE);
    });
  });

  test(`redirects to the ${config.TRUST_INFO_PAGE} page`, async () => {
    mockPrepareData.mockImplementationOnce( () => TRUST_DATA );
    const resp = await request(app).post(config.TRUST_INFO_URL).send(TRUSTS_ADD_MORE);

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.TRUST_INFO_URL);
  });

  test("catch error when rendering the page", async () => {
    mockSetApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).post(config.TRUST_INFO_URL);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
