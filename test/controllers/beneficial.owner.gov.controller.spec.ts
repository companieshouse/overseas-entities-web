jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');

import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import { authentication } from "../../src/controllers";
import app from "../../src/app";
import * as config from "../../src/config";
import { getApplicationData, prepareData, setApplicationData } from '../../src/utils/application.data';
import { BENEFICIAL_OWNER_GOV_PAGE_HEADING, MESSAGE_ERROR, SERVICE_UNAVAILABLE  } from "../__mocks__/text.mock";
import { logger } from "../../src/utils/logger";
import { BENEFICIAL_OWNER_GOV_OBJECT_MOCK } from "../__mocks__/session.mock";
import { BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebug = logger.debug as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
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
      expect(resp.text).toContain("a11");
      expect(resp.text).toContain("my company name");
      expect(resp.text).toContain(`"influence" checked`);
    });

    test("Should render the error page", async () => {
      mockLoggerDebug.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
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

    test(`adds data to the session and redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      // controller will make several calls to prepare data, we have to mock them in order they are called by controller
      // mock the call to prepareData for beneficialOwnerGov object
      mockPrepareData.mockReturnValueOnce({ corporationName: "test" });
      // mock the call to prepareData for principalAddress object
      mockPrepareData.mockReturnValueOnce({ addressLine1: "principalAddressLine1", addressLine2: "principalAddressLine2" });
      // mock the call to prepareData for serviceAddress object
      mockPrepareData.mockReturnValueOnce({ addressLine1: "serviceAddressLine1", addressLine2: "serviceAddressLine2" });
      // mock the call to prepareData for corporationStartDate object
      mockPrepareData.mockReturnValueOnce({ day: 1, month: 2, year: 1934 });

      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      const beneficialOwnerGov = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerGov.corporationName).toEqual("test");
      expect(beneficialOwnerGov.principalAddress.addressLine1).toEqual("principalAddressLine1");
      expect(beneficialOwnerGov.principalAddress.addressLine2).toEqual("principalAddressLine2");
      expect(beneficialOwnerGov.serviceAddress.addressLine1).toEqual("serviceAddressLine1");
      expect(beneficialOwnerGov.serviceAddress.addressLine2).toEqual("serviceAddressLine2");
      expect(beneficialOwnerGov.corporationStartDate.day).toEqual(1);
      expect(beneficialOwnerGov.corporationStartDate.month).toEqual(2);
      expect(beneficialOwnerGov.corporationStartDate.year).toEqual(1934);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebug.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

  });
});
