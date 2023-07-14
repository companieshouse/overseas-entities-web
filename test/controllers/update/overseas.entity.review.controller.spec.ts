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
  SERVICE_UNAVAILABLE
} from "../../__mocks__/text.mock";

import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";

import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
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

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetPrivateOeDetails = getPrivateOeDetails as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const getPrivateDataAppDataMock = () => {
  const appDataMock = {
    overseas_entity_id: "2468",
    transaction_id: "13579",
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
    test(`redirects ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
    });

    test(`redirect when ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private details fetched returning nothing`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce(undefined);
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(mockGetPrivateOeDetails).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(0);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(0);
    });

    test(`redirect when ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private details fetched returning no email`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce({ });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
    });

    test(`redirect when ${config.OVERSEAS_ENTITY_REVIEW_PAGE} page with private details fetched returning empty email`, async () => {

      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(getPrivateDataAppDataMock());
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "" });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_REVIEW_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
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
});
