jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  TRUSTS_NOC_HEADING,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_HEADING,
} from "../../__mocks__/text.mock";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData, mapDataObjectToFields, prepareData } from "../../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA,
  REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST,
  REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_PARTIAL,
  SERVICE_ADDRESS_MOCK,
  RESIDENTIAL_ADDRESS_MOCK,
  UPDATE_BENEFICIAL_OWNER_HAVE_DAY_OF_BIRTH_OBJECT_MOCK,
  REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_HAVE_DAY_OF_BIRTH
} from "../../__mocks__/session.mock";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { ApplicationData, beneficialOwnerIndividualType } from "../../../src/model";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

const mockMapDataObjectToFields = mapDataObjectToFields as jest.Mock;

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe(`Update review beneficial owner individual controller`, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`render the review-beneficial-owner-individual page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      mockMapDataObjectToFields.mockReturnValueOnce(SERVICE_ADDRESS_MOCK);
      mockMapDataObjectToFields.mockReturnValueOnce(RESIDENTIAL_ADDRESS_MOCK);

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.text).toContain("residential address addressLine1");
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
    });

    test("return empty object when no address in data to review", async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      mockMapDataObjectToFields.mockReturnValueOnce(SERVICE_ADDRESS_MOCK);

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.text).not.toContain("residential address addressLine1");
    });

    // ASM-350 - need fix to create a real error
    test.skip("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`error if index param is undefined and no redirection to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK
      });
      mockPrepareData.mockImplementationOnce( () => REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA );

      const resp = await request(app)
        .post(config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL)
        .send(REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`redirect to beneficial owner type page ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} on successful submission`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK
      });
      mockPrepareData.mockImplementationOnce( () => REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA );

      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST)
        .send(REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`verify that have_day_of_birth is set following post method if set to true in app data`, async () => {
      const appData: ApplicationData = {
        [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [UPDATE_BENEFICIAL_OWNER_HAVE_DAY_OF_BIRTH_OBJECT_MOCK]
      };
      mockGetApplicationData.mockReturnValue(appData);
      mockPrepareData.mockImplementationOnce( () => REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_HAVE_DAY_OF_BIRTH );

      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST)
        .send(REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_HAVE_DAY_OF_BIRTH);

      expect(resp.status).toEqual(302);
      if (appData.beneficial_owners_individual) {
        expect(appData.beneficial_owners_individual[0].have_day_of_birth).toEqual(true);
      }
    });

    test(`verify that have_day_of_birth is not set following post method if not set in app data`, async () => {
      const appData = APPLICATION_DATA_MOCK;

      mockGetApplicationData.mockReturnValue(appData);
      mockPrepareData.mockImplementationOnce( () => REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA );

      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL_TEST)
        .send(REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA);

      expect(resp.status).toEqual(302);
      if (appData.beneficial_owners_individual) {
        expect(appData.beneficial_owners_individual[0].have_day_of_birth).toBeUndefined();
      }
    });

    test(`throw validation error on incomplete individual bo review submission`, async () => {

      mockPrepareData.mockImplementationOnce( () => REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_PARTIAL );

      const resp = await request(app).post(config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL).send(REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_PARTIAL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_HEADING);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
    });

    test(`POST empty object and do not redirect to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY );
      const resp = await request(app)
        .post(config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_URL_WITH_PARAM_URL)
        .send(REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST);
      expect(resp.header.location).not.toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
