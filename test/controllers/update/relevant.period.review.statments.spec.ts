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

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  PAGE_NOT_FOUND_TEXT,
  RELEVANT_PERIOD,
  RELEVANT_PERIOD_CHANGE_BO,
  RELEVANT_PERIOD_NO_CHANGE_BO,
  RELEVANT_PERIOD_TRUSTEE_INVOLVED,
  RELEVANT_PERIOD_NO_TRUSTEE_INVOLVED,
  RELEVANT_PERIOD_CHANGE_BENEFICIARY,
  RELEVANT_PERIOD_NO_CHANGE_BENEFICIARY
} from "../../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";

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

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

describe.skip("owned review statements page tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL} page with all statements selected`, async () => {
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_MOCK,
        update: UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE });

      const resp = await request(app).get(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_CHANGE_BO);
      expect(resp.text).toContain(RELEVANT_PERIOD_TRUSTEE_INVOLVED);
      expect(resp.text).toContain(RELEVANT_PERIOD_CHANGE_BENEFICIARY);

      expect(resp.text).toContain(RELEVANT_PERIOD);
      expect(resp.text).toContain("1");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2023");
    });

    test(`renders the ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL} page with all statements de-selected`, async () => {
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_MOCK,
        update: UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE });

      const resp = await request(app).get(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_NO_CHANGE_BO);
      expect(resp.text).toContain(RELEVANT_PERIOD_NO_TRUSTEE_INVOLVED);
      expect(resp.text).toContain(RELEVANT_PERIOD_NO_CHANGE_BENEFICIARY);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app).get(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${config.UPDATE_FILING_DATE_URL} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_FILING_DATE_URL);
    });
  });
});
