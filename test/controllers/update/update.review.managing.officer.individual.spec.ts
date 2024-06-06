jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import request from "supertest";
import app from "../../../src/app";
import * as config from "../../../src/config";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { NextFunction } from "express";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData, mapDataObjectToFields, prepareData } from "../../../src/utils/application.data";
import {
  APPLICATION_DATA_CH_REF_UPDATE_MOCK,
  APPLICATION_DATA_EMPTY_BO_MOCK,
  APPLICATION_DATA_UPDATE_BO_MOCK,
  REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY,
  UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST,
  UPDATE_REVIEW_MANAGING_OFFICER_MOCK,
  UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO,
  RESIDENTIAL_ADDRESS_MOCK,
  UPDATE_MANAGING_OFFICER_HAVE_DAY_OF_BIRTH_MOCK,
} from "../../__mocks__/session.mock";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_HEADING } from '../../__mocks__/text.mock';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { ApplicationData, managingOfficerType } from '../../../src/model';

mockCsrfProtectionMiddleware.mockClear();
mockRemoveJourneyMiddleware.mockClear();

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockMapDataObjectToFields = mapDataObjectToFields as jest.Mock;

describe('Test review managing officer', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test(`that render ${config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE} is rendered with resign on date`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_CH_REF_UPDATE_MOCK,
        ...UPDATE_REVIEW_MANAGING_OFFICER_MOCK
      });
      const resp = await request(app).get(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
    });

    test(`render the ${config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_EMPTY_BO_MOCK,
      });
      mockMapDataObjectToFields.mockReturnValueOnce(RESIDENTIAL_ADDRESS_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.text).toContain("Bloggs");
      expect(resp.text).toContain("residential address addressLine1");
    });

    test('residential address not displayed when no address returned', async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_EMPTY_BO_MOCK,
      });
      const resp = await request(app).get(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).not.toContain("residential address addressLine1");
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe(`POST tests`, () => {
    test(`redirect to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page on successful submission`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_UPDATE_BO_MOCK
      });
      mockPrepareData.mockImplementationOnce( () => UPDATE_REVIEW_MANAGING_OFFICER_MOCK );
      const resp = await request(app)
        .post(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST)
        .send(UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/update-an-overseas-entity/update-beneficial-owner-type");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`verify that have_day_of_birth is set following post method if set to true in app data`, async () => {
      const appData: ApplicationData = {
        [managingOfficerType.ManagingOfficerKey]: [UPDATE_MANAGING_OFFICER_HAVE_DAY_OF_BIRTH_MOCK]
      };

      mockGetApplicationData.mockReturnValueOnce(appData);
      mockPrepareData.mockImplementationOnce( () => UPDATE_REVIEW_MANAGING_OFFICER_MOCK );
      const resp = await request(app)
        .post(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST)
        .send(UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO);

      expect(resp.status).toEqual(302);
      if (appData.managing_officers_individual) {
        expect(appData.managing_officers_individual[0].have_day_of_birth).toEqual(true);
      }
    });

    test(`verify that have_day_of_birth is not set following post method if not set in app data`, async () => {
      const appData = APPLICATION_DATA_UPDATE_BO_MOCK;

      mockGetApplicationData.mockReturnValueOnce(appData);
      mockPrepareData.mockImplementationOnce( () => UPDATE_REVIEW_MANAGING_OFFICER_MOCK );
      const resp = await request(app)
        .post(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST)
        .send(UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO);

      expect(resp.status).toEqual(302);
      if (appData.managing_officers_individual) {
        expect(appData.managing_officers_individual[0].have_day_of_birth).toBeUndefined();
      }
    });

    test(`throw validation error on ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} without complete data`, async () => {
      const resp = await request(app)
        .post(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST)
        .send(REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_HEADING);
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY);
      expect(resp.text).toContain(ErrorMessages.ROLE_AND_RESPONSIBILITIES_INDIVIDUAL);
      expect(resp.text).toContain(ErrorMessages.OCCUPATION);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`error if index param is undefined and no redirection to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK
      });
      const resp = await request(app).post(config.UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_URL_WITH_PARAM_URL)
        .send(UPDATE_REVIEW_MANAGING_OFFICER_MOCK_STILL_MO);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});

