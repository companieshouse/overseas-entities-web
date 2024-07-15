jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/utils/relevant.period');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
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
} from "../../__mocks__/text.mock";

import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { OVERSEAS_NAME_MOCK } from "../../__mocks__/session.mock";

import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { logger } from "../../../src/utils/logger";
import { UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_TITLE } from "../../__mocks__/text.mock";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { checkRelevantPeriod } from "../../../src/utils/relevant.period";

mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockCheckRelevantPeriod = checkRelevantPeriod as jest.Mock;

describe("BENEFICIAL OWNER BO MO REVIEW controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain("SA000392");
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page when statement validation flag is on`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(OVERSEAS_NAME_MOCK);
      expect(resp.text).toContain("SA000392");
    });

    test("catch error when rendering the Overseas Entity Review page on GET method", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      mockIsActiveFeature.mockReturnValue(true);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
    });

    test(`catch error on POST action for ${config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page`, async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
