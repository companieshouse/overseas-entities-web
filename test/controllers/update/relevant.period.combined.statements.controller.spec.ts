jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/service/overseas.entities.service');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
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
import { ErrorMessages } from "../../../src/validation/error.messages";
import { UpdateKey } from "../../../src/model/update.type.model";

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
      expect(resp.text).toContain("2023");
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
  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE} page page with banner when registration date is equal to 31 January 2023.`, async () => {
    mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK, [UpdateKey]: { date_of_creation: { day: "31", month: "01", year: "2023" } } });
    const resp = await request(app).get(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
    expect(resp.status).toEqual(200);
    expect(resp.text).toMatch(/31\s+January\s+2023/i);
  });
  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE} page page with banner when registration date is equal to 27 February 2022, but 31 January is displayed`, async () => {
    mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK, [UpdateKey]: { date_of_creation: { day: "27", month: "02", year: "2022" } } });
    const resp = await request(app).get(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toMatch(/31\s+January\s+2023/i);
    expect(resp.text).not.toMatch(/27\s+February\s+2022/i);
  });
});

describe("POST tests", () => {
  test(`renders the ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL} page when 1st statement is checked`, async () => {
    mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_MOCK });
    const resp = await request(app)
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .send({ relevant_period_combined_statements: "change_bo_relevant_period" });

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL);
  });

  test('should send redirect when anything is sent', async () => {
    // Arrange
    const resp = await request(app)
      // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL + config.RELEVANT_PERIOD_QUERY_PARAM)
      .send({ relevant_period_combined_statements: "ANYTHING" });

    // Assert
    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
  });

  test('when feature flag is off, 404 is returned', async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const resp = await request(app).post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);

    expect(resp.status).toEqual(404);
    expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
  });

  test(`renders the ${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE} with error when checkbox is empty`, async () => {
    const resp = await request(app).post(`${config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL}`);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain(RELEVANT_PERIOD_COMBINED_STATEMENTS_TITLE);
    expect(resp.text).toContain(ErrorMessages.RELEVANT_PERIOD_COMBINED_STATEMENTS_CHECKBOX);
  });
});
