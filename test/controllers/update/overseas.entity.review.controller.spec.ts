jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock("../../../src/utils/feature.flag" );
jest.mock("../../../src/service/private.overseas.entity.details");
jest.mock("../../../src/service/overseas.entities.service");

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  OVERSEAS_ENTITY_UPDATE_TITLE,
  CHANGE_LINK,
  CHANGE_LINK_ENTITY_NAME,
  CHANGE_LINK_ENTITY_EMAIL,
  CHANGE_LINK_ENTITY_GOVERNING_LAW,
  CHANGE_LINK_ENTITY_INCORPORATION_COUNTRY,
  CHANGE_LINK_ENTITY_LEGAL_FORM,
  CHANGE_LINK_ENTITY_PRINCIPAL_ADDRESS,
  CHANGE_LINK_ENTITY_SERVICE_ADDRESS
} from "../../__mocks__/text.mock";

import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";

import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { hasOverseasEntity } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getPrivateOeDetails } from "../../../src/service/private.overseas.entity.details";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { ApplicationData } from "../../../src/model";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetPrivateOeDetails = getPrivateOeDetails as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const getPrivateDataAppDataMock = () => {
  const appDataMock = {
    overseas_entity_id: "123456",
    entity_name: "Overseas Entity Name",
    entity: {
      incorporation_country: "incorporationCountry",
      email: undefined
    }
  };
  return appDataMock as ApplicationData;
};

describe("OVERSEAS ENTITY REVIEW controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_UPDATE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Overseas Entity Name");
      expect(resp.text).toContain("incorporationCountry");
    });

    test(`renders the ${config.OVERSEAS_ENTITY_REVIEW_PAGE} with Change links`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_UPDATE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(CHANGE_LINK);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_NAME);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_INCORPORATION_COUNTRY);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_SERVICE_ADDRESS);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_EMAIL);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_LEGAL_FORM);
      expect(resp.text).toContain(CHANGE_LINK_ENTITY_GOVERNING_LAW);
    });

    test(`renders the ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private date fetched`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "tester@test.com" });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_UPDATE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Overseas Entity Name");
      expect(resp.text).toContain("incorporationCountry");
      expect(resp.text).toContain("tester@test.com");

      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private date fetched when no entity`, async () => {

      const mockAppData = getPrivateDataAppDataMock();
      mockAppData.entity = undefined;

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "tester@test.com" });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_UPDATE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page without private date fetched`, async () => {

      const appDataMock = getPrivateDataAppDataMock();
      if (appDataMock.entity) {
        appDataMock.entity.email = "dev@test.com";
      }

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(appDataMock);

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_UPDATE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Overseas Entity Name");
      expect(resp.text).toContain("incorporationCountry");
      expect(resp.text).toContain("dev@test.com");

      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(0);
      expect(mockSetExtraData).toHaveBeenCalledTimes(0);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(0);
    });

    test(`renders the ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page without private date fetched when no submission`, async () => {

      const appDataMock = getPrivateDataAppDataMock();
      appDataMock.overseas_entity_id = undefined;

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(appDataMock);

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_UPDATE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("Overseas Entity Name");
      expect(resp.text).toContain("incorporationCountry");
      expect(resp.text).not.toContain("tester@test.com");

      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(0);
      expect(mockSetExtraData).toHaveBeenCalledTimes(0);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(0);
    });

    test(`catch error when ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private date fetched returning nothing`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce(undefined);
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);

      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(0);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(0);
    });

    test(`catch error when ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private date fetched returning no email`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce({ });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`catch error when ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private date fetched returning empty email`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "" });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("catch error when rendering the Overseas Entity Review page on GET method", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("catch service error when rendering the Overseas Entity Review page on GET method with failing private data fetch", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${config.BENEFICIAL_OWNER_STATEMENTS_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_PAGE);
    });

    test(`catch error on POST action for ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page`, async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
