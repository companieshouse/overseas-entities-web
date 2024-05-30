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
  SERVICE_UNAVAILABLE,
  RELEVANT_PERIOD_COMBINED_STATEMENTS_TITLE,
  RELEVANT_PERIOD_COMBINED_STATEMENTS_TEXT,
  RELEVANT_PERIOD,
  PAGE_NOT_FOUND_TEXT,
  ANY_MESSAGE_ERROR
} from "../../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
// import { CombinedStatementPageKey } from "../../../src/model/update.type.model";

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
      expect(resp.text).toContain(RELEVANT_PERIOD_COMBINED_STATEMENTS_TITLE);
      expect(resp.text).toContain(RELEVANT_PERIOD_COMBINED_STATEMENTS_TEXT);
      expect(resp.text).toContain(RELEVANT_PERIOD);
      expect(resp.text).toContain("1");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2011");
    });
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

describe("POST tests", () => {
  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL} page when 1st statement is checked`, async () => {
    const resp = await request(app)
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .send({ combined_page_for_statements: "REGISTRABLE_BENEFICIAL_OWNER" });

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
  });
  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL} page when 2nd statement is checked`, async () => {
    const resp = await request(app)
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .send({ combined_page_for_statements: "ANY_TRUSTS_INVOLVED" });

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
  });
  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL} page when 3rd statement is checked`, async () => {
    const resp = await request(app)
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .send({ combined_page_for_statements: "BENEFICIARY_OF_A_TRUST_INVOLVED" });

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
  });
  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL} page when 'none of these' is checked`, async () => {
    const resp = await request(app)
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .send({ combined_page_for_statements: "NONE_OF_THESE" });

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
  });
});