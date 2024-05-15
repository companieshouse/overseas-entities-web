jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/feature.flag');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE,
  PAGE_NOT_FOUND_TEXT,
} from "../../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";

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

describe("Combined Statements Page tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("GET tests", () => {
    test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
      const resp = await request(app).get(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE);
      expect(resp.text).toContain("The relevant period is between <strong>28 February 2022</strong> and <strong>");
      expect(resp.text).toContain("1");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2011");
    });
    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app).get(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});
