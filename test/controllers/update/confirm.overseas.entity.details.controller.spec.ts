jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/service.availability.middleware');

import { beforeEach, jest, describe } from "@jest/globals";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData } from "../../../src/utils/application.data";
import request from "supertest";
import { NextFunction } from "express";
import { ANY_MESSAGE_ERROR, BACK_LINK_FOR_UPDATE_OE_CONFIRM, SERVICE_UNAVAILABLE } from "../../__mocks__/text.mock";
import {
  testEntityNumber,
  testEntityName,
  entityModelMock,
  entityProfileModelMock,
  updateModelMock,
  missingDateOfCreationMock,
  testIncorporationCountry
} from "../../__mocks__/update.entity.mocks";
import {
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK
} from "../../__mocks__/session.mock";
import { UpdateKey } from "../../../src/model/update.type.model";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Confirm company data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
  });

  describe("Get confirm overseas entity details", () => {
    test(`renders the ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} page`, async () => {

      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock).mockReturnValueOnce(entityProfileModelMock);
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BACK_LINK_FOR_UPDATE_OE_CONFIRM);
      expect(resp.text).toContain(testEntityName);
      expect(resp.text).toContain("January");
      expect(resp.text).toContain(testEntityNumber);
      expect(resp.text).toContain(testIncorporationCountry);
    });

    test(`redirects if no update data`, async () => {
      mockGetApplicationData.mockReturnValueOnce(entityModelMock);

      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirects if no date of creation`, async () => {
      mockGetApplicationData.mockReturnValueOnce(missingDateOfCreationMock);

      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirects if no entity data`, async () => {
      mockGetApplicationData.mockReturnValueOnce(updateModelMock);

      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test('catch error when rendering the page', async () => {
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock);

      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("Post confirm overseas entity details", () => {
    test(`redirects to overseas-entity-query page if no entity`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});

      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test(`redirect to update-filing-date if no BOs`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
    });

    test.each([
      ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK ],
      ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK ]
    ])(`redirect to update-filing-date if %s but does not have nature of controls related to trusts`, async (_, key, mockObject) => {
      let appData = {};
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = {
        ...UPDATE_OBJECT_MOCK,
        [key]: [ mockObject ]
      };

      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
    });

    test.each([
      ["BO Individual", "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK ],
      ["BO Corporate", "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_OBJECT_MOCK ]
    ])(`redirect to update-trusts-submit-by-paper if %s that has nature of controls related to trusts`, async (_, key, mockObject) => {
      let appData = {};
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = {
        ...UPDATE_OBJECT_MOCK,
        [key]: [ mockObject ]
      };

      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW);
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_TRUSTS_SUBMIT_BY_PAPER_URL);
    });

    test('catch error when posting to the page', async () => {
      mockGetApplicationData.mockReturnValueOnce(entityProfileModelMock);

      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
