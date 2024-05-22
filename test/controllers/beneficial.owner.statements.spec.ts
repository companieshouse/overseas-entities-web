jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.entity.middleware');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");
import { describe, expect, test, beforeEach, jest } from "@jest/globals";
import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import app from "../../src/app";
import * as config from "../../src/config";
import {
  APPLICATION_DATA_MOCK_WITHOUT_UPDATE,
  APPLICATION_DATA_REGISTRATION_MOCK,
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  ERROR
} from "../__mocks__/session.mock";
import {
  BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING,
  PAGE_TITLE_ERROR,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE,
} from "../__mocks__/text.mock";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
  getApplicationData,
} from "../../src/utils/application.data";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import {
  BeneficialOwnersStatementType,
  BeneficialOwnerStatementKey,
} from "../../src/model/beneficial.owner.statement.model";
import { ErrorMessages } from "../../src/validation/error.messages";
import { hasEntity } from "../../src/middleware/navigation/has.entity.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();
const mockHasEntityMiddleware = hasEntity as jest.Mock;
mockHasEntityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockCheckBOsDetailsEntered = checkBOsDetailsEntered as jest.Mock;
const mockCheckMOsDetailsEntered = checkMOsDetailsEntered as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

const redirectUrl = `${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?${BeneficialOwnerStatementKey}=`;
const redirectWithParmsUrl = `${NEXT_PAGE_URL}?${BeneficialOwnerStatementKey}=`;

describe("BENEFICIAL OWNER STATEMENTS controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    process.env.FEATURE_FLAG_ENABLE_REDIS_REMOVAL_27092023 = "false";
  });

  describe("GET tests", () => {
    test("renders the beneficial owner statements page with Registration data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_REGISTRATION_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the beneficial owner statements page with undefined entity_number", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK_WITHOUT_UPDATE);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the beneficial owner statements page with Update data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
  describe("GET with url params tests", () => {
    test("renders the beneficial owner statements page with Registration data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_REGISTRATION_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the beneficial owner statements page with undefined entity_number", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK_WITHOUT_UPDATE);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the beneficial owner statements page with Update data", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_UPDATE_BO_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("redirects to the beneficial owner type page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirects to ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}
              page with NONE_IDENTIFIED as beneficial owners statement type`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
      });
      mockCheckBOsDetailsEntered.mockReturnValueOnce(true);

      const boStatement = BeneficialOwnersStatementType.NONE_IDENTIFIED;
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: boStatement });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${redirectUrl}${boStatement}`);
    });

    test(`redirects to ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}
              page with ALL_IDENTIFIED_ALL_DETAILS as beneficial owners statement type`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
      });
      mockCheckMOsDetailsEntered.mockReturnValueOnce(true);

      const boStatement = BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS;
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: boStatement });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${redirectUrl}${boStatement}`);
    });
  });

  describe("POST with url params tests", () => {
    test("redirects to the beneficial owner type page with url params", async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirects to ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}
              page with NONE_IDENTIFIED as beneficial owners statement type`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL - getRedirectURL
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL - getWarningRedirectURL
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
      });
      mockCheckBOsDetailsEntered.mockReturnValueOnce(true);

      const boStatement = BeneficialOwnersStatementType.NONE_IDENTIFIED;
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: boStatement });

      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${redirectWithParmsUrl}${boStatement}`);
    });

    test(`redirects to ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}
              page with ALL_IDENTIFIED_ALL_DETAILS as beneficial owners statement type`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL - getRedirectURL
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL - getWarningRedirectURL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
      });
      mockCheckMOsDetailsEntered.mockReturnValueOnce(true);

      const boStatement = BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS;
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: boStatement });

      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${redirectWithParmsUrl}${boStatement}`);
    });
  });

});
