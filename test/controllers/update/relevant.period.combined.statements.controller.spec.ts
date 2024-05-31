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
import { url } from "inspector";
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
  const mockPageData = request(app.response.json);
  test('should initialize application data', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
    // Assert
      .expect(url() === config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .expect(function(resp){
        resp.body.combined_page_for_statements.json.toContain(mockPageData);
      });
  });

  test('should redirect to RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL when submit is pressed', async () => {
    // Arrange
    const resp = await request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL);
    // Assert
    expect(resp.statusCode).toEqual(302);
  });

  test('should send 1st value when 1st checkbox is checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .set('Content-Type', 'application/json')
      .send({ combined_page_for_statements: "REGISTRABLE_BENEFICIAL_OWNER" })
    // Assert
      .expect(function(resp){
        resp.statusCode === 200;
        resp.body.toEqual({});
      });
  });

  test('should send 2nd value when 2nd checkbox is checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .set('Content-Type', 'application/json')
      .send({ combined_page_for_statements: "ANY_TRUSTS_INVOLVED" })
    // Assert
      .expect(function(resp){
        resp.statusCode === 200;
        resp.body.toEqual({});
      });
  });

  test('should send 3rd value when 3rd checkbox is checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .set('Content-Type', 'application/json')
      .send({ combined_page_for_statements: "BENEFICIARY_OF_A_TRUST_INVOLVED" })
    // Assert
      .expect(function(resp){
        resp.statusCode === 200;
        resp.body.toEqual({});
      });
  });

  test('should send 4th value when 4th checkbox is checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .set('Content-Type', 'application/json')
      .send({ combined_page_for_statements: "NONE_OF_THESE" })
    // Assert
      .expect(function(resp){
        resp.statusCode === 200;
        resp.body.toEqual({});
      });
  });

  test('should send 2 values when 2 checkboxes are checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .set('Content-Type', 'application/json')
      .send({ combined_page_for_statements: "REGISTRABLE_BENEFICIAL_OWNER,BENEFICIARY_OF_A_TRUST_INVOLVED" })
    // Assert
      .expect(function(resp){
        resp.statusCode === 200;
        resp.body.toEqual({});
      });
  });

  test('should send 3 values when first 3 checkboxes are checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .set('Content-Type', 'application/json')
      .send({ combined_page_for_statements: "REGISTRABLE_BENEFICIAL_OWNER,ANY_TRUSTS_INVOLVED,BENEFICIARY_OF_A_TRUST_INVOLVED" })
    // Assert
      .expect(function(resp){
        resp.statusCode === 200;
        resp.body.toEqual({});
      });
  });
});

describe("Errors - POST tests", () => {
  // MUST BE REWRITTEN WHEN ERROR HANDLING IS ADDED
  test('should throw an error when no checkboxes are checked', () => {
    // Arrange
    request(app)
    // Act
      .post(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL)
      .send({})
    // Assert
      .expect(function(resp) {
        resp.statusCode === 500;
      });
  });
});
