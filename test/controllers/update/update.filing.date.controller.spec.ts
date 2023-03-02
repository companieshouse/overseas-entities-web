jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');

import * as config from "../../../src/config";
import app from "../../../src/app";
import request from "supertest";
import { beforeEach, jest, test, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasOverseasEntityNumber } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";

import {
  ANY_MESSAGE_ERROR,
  BACK_LINK_FOR_UPDATE_FILING_DATE,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { NextFunction } from "express";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockHasOverseasEntityNumber = hasOverseasEntityNumber as jest.Mock;
mockHasOverseasEntityNumber.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Update Filing Date controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.UPDATE_FILING_DATE_PAGE} page`, async () => {
      const resp = await request(app).get(config.UPDATE_FILING_DATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Date (NOT LIVE)");
      expect(resp.text).toContain(BACK_LINK_FOR_UPDATE_FILING_DATE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_FILING_DATE_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${config.OVERSEAS_ENTITY_PRESENTER_URL} page after a successful post from ${config.UPDATE_FILING_DATE_PAGE}`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_FILING_DATE_URL)
        .send({});

      expect(resp.status).toEqual(302);
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.UPDATE_FILING_DATE_URL)
        .send({});
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
