jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import * as config from "../../../src/config";
import { getApplicationData, mapDataObjectToFields, prepareData } from "../../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_UPDATE_BO_MOCK,
  DISTINCT_PRINCIPAL_ADDRESS_MOCK,
  REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA,
  UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST,
  UPDATE_REVIEW_BENEFICIAL_OWNER_MOCK_DATA,
} from "../../__mocks__/session.mock";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import request from "supertest";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING,
  TRUSTS_NOC_HEADING,
} from "../../__mocks__/text.mock";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { NextFunction } from "express";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { saveAndContinue } from "../../../src/utils/save.and.continue";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockMapDataObjectToFields = mapDataObjectToFields as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;

const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe(`Update review beneficial owner Gov`, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET tests`, () => {
    test(`render the ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
      mockMapDataObjectToFields.mockReturnValueOnce(DISTINCT_PRINCIPAL_ADDRESS_MOCK);
      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain("principal addressLine1");
    });

    test("return empty object when no address in data to review", async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(resp.text).not.toContain("principal addressLine1");
    });

    test(`render the ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE} page With ceased date`, async () => {
      mockGetApplicationData.mockReturnValueOnce(
        { ...APPLICATION_DATA_MOCK });

      mockPrepareData.mockImplementationOnce( () => REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA );

      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe(`POST tests`, () => {

    test(`throw validation error on bo gov review submission without form address data`, async () => {
      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST)
        .send(REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirect to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page on successful submission`, async () => {
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK
      });
      mockPrepareData.mockImplementationOnce( () => UPDATE_REVIEW_BENEFICIAL_OWNER_MOCK_DATA );

      const resp = await request(app)
        .post(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST)
        .send(UPDATE_REVIEW_BENEFICIAL_OWNER_MOCK_DATA);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`validation error is shown with empty submitted data`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
      });
      const resp = await request(app).post(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.BO_GOV_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_STILL_BENEFICIAL_OWNER);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.header.location).not.toEqual(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`error if index param is undefined and no redirection to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE}`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK
      });
      mockPrepareData.mockImplementationOnce( () => UPDATE_REVIEW_BENEFICIAL_OWNER_MOCK_DATA );

      const resp = await request(app)
        .post(config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL)
        .send(UPDATE_REVIEW_BENEFICIAL_OWNER_MOCK_DATA);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
