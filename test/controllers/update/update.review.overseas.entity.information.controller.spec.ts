jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.due.diligence.details.middleware');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import {
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
  OVERSEAS_ENTITY_UPDATE_DETAILS_URL
} from "../../../src/config";
import app from "../../../src/app";
import {
  APPLICATION_DATA_MOCK
} from '../../__mocks__/session.mock';
import { OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } from "../../__mocks__/overseas.entity.due.diligence.mock";
import {
  PAGE_TITLE_ERROR,
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE_TITLE
} from "../../__mocks__/text.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { hasDueDiligenceDetails } from "../../../src/middleware/navigation/update/has.due.diligence.details.middleware";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockHasDueDiligenceDetails = hasDueDiligenceDetails as jest.Mock;
mockHasDueDiligenceDetails.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Update review overseas entity information controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("href=\"/update-an-overseas-entity/update-due-diligence\"");
    });

    test(`renders the ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} page`, async () => {
      const appData = { ...APPLICATION_DATA_MOCK };
      appData.due_diligence = {};
      appData.overseas_entity_due_diligence = OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK;
      mockGetApplicationData.mockReturnValueOnce(appData);
      const resp = await request(app).get(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("href=\"/update-an-overseas-entity/due-diligence-overseas-entity\"");

    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${OVERSEAS_ENTITY_UPDATE_DETAILS_URL} page after a successful post from ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app)
        .post(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
