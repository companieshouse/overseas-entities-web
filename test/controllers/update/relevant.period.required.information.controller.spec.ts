jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/feature.flag');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { logger } from "../../../src/utils/logger";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  RELEVANT_PERIOD_REQUIRED_INFORMATION_TITLE,
  RELEVANT_PERIOD
} from "../../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL } from "../../../src/config";

mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

describe("relevant period required information page tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("GET tests", () => {
    test(`renders the ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_REQUIRED_INFORMATION_TITLE);
      expect(resp.text).toContain(RELEVANT_PERIOD);
      expect(resp.text).toContain("1");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2023");
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL + config.RELEVANT_PERIOD_QUERY_PARAM} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL + config.RELEVANT_PERIOD_QUERY_PARAM)
        .send({ 'required_information': "1" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE + config.RELEVANT_PERIOD_QUERY_PARAM);
    });
    test("catch error when validating the page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
