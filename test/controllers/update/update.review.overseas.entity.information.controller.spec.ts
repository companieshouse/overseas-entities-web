jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.due.diligence.details.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import {
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE,
  UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL,
  OVERSEAS_ENTITY_REVIEW_PAGE
} from "../../../src/config";
import app from "../../../src/app";
import {
  APPLICATION_DATA_MOCK
} from '../../__mocks__/session.mock';
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
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${OVERSEAS_ENTITY_REVIEW_PAGE} page after a successful post from ${UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app)
        .post(UPDATE_REVIEW_OVERSEAS_ENTITY_INFORMATION_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(OVERSEAS_ENTITY_REVIEW_PAGE);
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
