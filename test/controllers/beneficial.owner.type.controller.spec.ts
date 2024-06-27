import {BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL} from "../../src/config";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');
jest.mock('../../src/utils/trusts.ts');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/feature.flag" );
jest.mock("../../src/utils/url");

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import * as config from "../../src/config";
import { getApplicationData } from '../../src/utils/application.data';
import {
  SERVICE_UNAVAILABLE,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_ALL_IDENTIFIED_ALL_DETAILS,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_SOME_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_SOME_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO,
  PAGE_TITLE_ERROR,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT,
} from '../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  ERROR
} from '../__mocks__/session.mock';
import { ErrorMessages } from '../../src/validation/error.messages';
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from '../../src/model/beneficial.owner.statement.model';
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import { BeneficialOwnerTypeChoice, BeneficialOwnerTypeKey, ManagingOfficerTypeChoice } from '../../src/model/beneficial.owner.type.model';
import { ManagingOfficerKey } from "../../src/model/managing.officer.model";
import { ManagingOfficerCorporateKey } from "../../src/model/managing.officer.corporate.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import { BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../../src/model/beneficial.owner.individual.model";
import { checkEntityRequiresTrusts, getTrustLandingUrl } from "../../src/utils/trusts";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getUrlWithParamsToPath } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

const mockcheckEntityRequiresTrusts = checkEntityRequiresTrusts as jest.Mock;

const mockGetTrustLandingUrl = getTrustLandingUrl as jest.Mock;

const MOCKED_URL = "MOCKED_URL";

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_URL);

describe("BENEFICIAL OWNER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe("GET with url params tests", () => {
    test("renders the beneficial owner type page with url params when some are identified", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL); // back button
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
      expect(resp.text).not.toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT);
    });

    test("renders the beneficial owner type page with params url for beneficial owners", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS
      });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
    });

    test("renders the beneficial owner type page with params url for managing officers", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED
      });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
    });

    test("renders the beneficial owner type page with params url for beneficial owners with just the BOs options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED);
    });

    test("renders the beneficial owner type page with params url for beneficial owners with just the MOs options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED);
    });

    test("renders the beneficial owner type page with params url for beneficial owners with both options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_SOME_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_SOME_IDENTIFIED);
    });

    test("catch error when rendering the page with params url", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("renders the beneficial owner type page with correct urls for buttons and links", async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.ACTIVE_SUBMISSION_BASE_PATH);

      // 'no more to add' button url is 'add' button url + '/submit' , so we need to check the add button url exists in the html exactly twice
      const expectedBOTypePageUrl = config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.BENEFICIAL_OWNER_TYPE_PAGE;
      const regexp = new RegExp(expectedBOTypePageUrl, 'g'); // g for global - means that the regex engine will search for all
      //       occurrences of the pattern in the input string, rather than stopping after the first match
      expect(resp.text.match(regexp)).toHaveLength(2); // confirm only 2 occurrences, 1 for add button, 1 as part of the 'no more to add' url
      // check 'no more to add' button url is correct
      expect(resp.text).toContain(expectedBOTypePageUrl + "/submit");

      // check the 'change or remove' links are correct
      expect(resp.text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE);
      expect(resp.text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.BENEFICIAL_OWNER_OTHER_PAGE);
      expect(resp.text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.BENEFICIAL_OWNER_GOV_PAGE);
      expect(resp.text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.MANAGING_OFFICER_PAGE);
      expect(resp.text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.MANAGING_OFFICER_CORPORATE_PAGE);
    });
  });

  describe("GET tests", () => {

    test("renders the beneficial owner type page when some are identified", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL); // back button
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
      expect(resp.text).not.toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT);
    });

    test("renders the beneficial owner type page for beneficial owners", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS
      });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
    });

    test("renders the beneficial owner type page for managing officers", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED
      });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
    });

    test("renders the beneficial owner type page for beneficial owners with just the BOs options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED);
    });

    test("renders the beneficial owner type page for beneficial owners with just the MOs options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED);
    });

    test("renders the beneficial owner type page for beneficial owners with both options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_SOME_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_SOME_IDENTIFIED);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST with url params tests", () => {
    test(`redirects to the ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_URL);
      expect(resp.header.location).toEqual(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.otherLegal });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_URL);
      expect(resp.header.location).toEqual(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.government });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_URL);
      expect(resp.header.location).toEqual(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);
    });

    test(`redirects to the ${config.MANAGING_OFFICER_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_URL);
      expect(resp.header.location).toEqual(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.MANAGING_OFFICER_WITH_PARAMS_URL);
    });

    test(`redirects to the ${config.MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.corporate });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_URL);
      expect(resp.header.location).toEqual(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.MANAGING_OFFICER_CORPORATE_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message when ${BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS} has been selected `, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_YOU_WANT_TO_ADD);
      expectTextToContainBOTypePageURL(resp.text);
    });

    test(`renders the current page with error message when ${BeneficialOwnersStatementType.NONE_IDENTIFIED} has been selected `, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      expectTextToContainBOTypePageURL(resp.text);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has been selected `, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      expectTextToContainBOTypePageURL(resp.text);
    });

    test(`POST empty object and check for error in page title`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app).post(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expectTextToContainBOTypePageURL(resp.text);
    });

    const expectTextToContainBOTypePageURL = (text: string) => {
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      //expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.ACTIVE_SUBMISSION_BASE_PATH);
      expect(text).toContain(config.REGISTER_AN_OVERSEAS_ENTITY_URL + MOCKED_URL + config.BENEFICIAL_OWNER_TYPE_PAGE);
    };
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_INDIVIDUAL_URL);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.otherLegal });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_OTHER_URL);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.government });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_GOV_URL);
    });

    test(`redirects to the ${config.MANAGING_OFFICER_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.MANAGING_OFFICER_URL);
    });

    test(`redirects to the ${config.MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.corporate });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.MANAGING_OFFICER_CORPORATE_URL);
    });

    test(`renders the current page with error message when ${BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS} has been selected `, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_YOU_WANT_TO_ADD);
      expect(mockGetUrlWithParamsToPath).not.toHaveBeenCalled();
    });

    test(`renders the current page with error message when ${BeneficialOwnersStatementType.NONE_IDENTIFIED} has been selected `, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      expect(mockGetUrlWithParamsToPath).not.toHaveBeenCalled();
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has been selected `, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      expect(mockGetUrlWithParamsToPath).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockGetUrlWithParamsToPath).not.toHaveBeenCalled();
    });
  });

  describe("POST Submit with url params tests", () => {

    test(`redirects to the  ${config.CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(MOCKED_URL);
      expect(resp.header.location).toEqual(MOCKED_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.CHECK_YOUR_ANSWERS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has both beneficial owner and managing officer with trusts`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.TRUST_INFO_URL);
    });

    test(`redirects to the trusts interrupt page with trusts and Feature Flag ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsActiveFeature.mockReturnValueOnce(true);

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(true);
      mockGetTrustLandingUrl.mockReturnValueOnce(config.TRUST_INTERRUPT_URL);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.TRUST_INTERRUPT_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only individual beneficial owner`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: [],
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only ole corporate beneficial owner`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerGovKey]: [],
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only gov beneficial owner`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only individual managing officer`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerCorporateKey]: [],
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only corporate managing officer`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerKey]: [],
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has no beneficial owner`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has no managing officer`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_WITH_PARAMS_URL);
    });
  });

  describe("POST Submit tests", () => {

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has both beneficial owner and managing officer with trusts`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.TRUST_INFO_URL);
    });

    test(`renders the current page with error message with trusts and Feature Flag ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(true);
      mockGetTrustLandingUrl.mockReturnValueOnce(config.TRUST_INTERRUPT_URL);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.TRUST_INTERRUPT_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has both beneficial owner and managing officer no trusts`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.CHECK_YOUR_ANSWERS_URL);
    });

    test(`redirects to the trusts interrupt page with trusts and Feature Flag ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_WEB

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockcheckEntityRequiresTrusts.mockReturnValueOnce(true);
      mockGetTrustLandingUrl.mockReturnValueOnce(config.TRUST_INTERRUPT_URL);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_WITH_PARAMS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.TRUST_INTERRUPT_URL);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only individual beneficial owner`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: [],
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only ole corporate beneficial owner`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerGovKey]: [],
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only gov beneficial owner`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only individual managing officer`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerCorporateKey]: [],
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has only corporate managing officer`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerKey]: [],
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has no beneficial owner`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_BENEFICIAL_OWNER);
    });

    test(`renders the current page with error message ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} has no managing officer`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: []
      });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.MUST_ADD_MANAGING_OFFICER);
    });
  });
});
