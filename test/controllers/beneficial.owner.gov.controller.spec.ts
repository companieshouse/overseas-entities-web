jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');

import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import { authentication } from "../../src/middleware/authentication.middleware";
import app from "../../src/app";
import * as config from "../../src/config";
import { getApplicationData, prepareData } from '../../src/utils/application.data';
import { BENEFICIAL_OWNER_GOV_PAGE_HEADING, MESSAGE_ERROR, SERVICE_UNAVAILABLE  } from "../__mocks__/text.mock";
import { logger } from "../../src/utils/logger";
import { BENEFICIAL_OWNER_GOV_OBJECT_MOCK, REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY } from "../__mocks__/session.mock";
import { BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

describe("BENEFICIAL OWNER GOV controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test("renders the beneficial owner gov page", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerGovKey]: BENEFICIAL_OWNER_GOV_OBJECT_MOCK });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain("my company name");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("LegalForm");
      expect(resp.text).toContain("a11");
    });

    test("Should render the error page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`POST empty object and redirect to ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY );

      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

  });
});
