jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock("../../../src/utils/feature.flag");
jest.mock("../../../src/service/private.overseas.entity.details");
jest.mock("../../../src/service/overseas.entities.service");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import app from "../../../src/app";
import * as config from "../../../src/config";

import { hasOverseasEntityNumber } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getPrivateOeDetails } from "../../../src/service/private.overseas.entity.details";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { NAVIGATION } from "../../../src/utils/navigation";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { EntityKey } from "../../../src/model/entity.model";
import { UPDATE_ENTITY_WITH_INVALID_CHARACTERS_FIELDS_MOCK } from "../../__mocks__/validation.mock";

import {
  prepareData,
  setExtraData,
  setApplicationData,
  fetchApplicationData,
} from "../../../src/utils/application.data";

import {
  COMPANY_NUMBER,
  ENTITY_OBJECT_MOCK,
  APPLICATION_DATA_MOCK,
  UPDATE_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS,
} from "../../__mocks__/session.mock";

import {
  PAGE_TITLE_ERROR,
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  UPDATE_ENTITY_PAGE_TITLE,
} from "../../__mocks__/text.mock";

import {
  EntityNumberKey,
  PublicRegisterNameKey,
  RegistrationNumberKey,
  PublicRegisterJurisdictionKey,
  IsOnRegisterInCountryFormedInKey,
} from "../../../src/model/data.types.model";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockHasOverseasEntityNumber = hasOverseasEntityNumber as jest.Mock;
mockHasOverseasEntityNumber.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockPrepareData = prepareData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetPrivateOeDetails = getPrivateOeDetails as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

describe("OVERSEAS ENTITY UPDATE DETAILS controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockFetchApplicationData.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test("renders the OVERSEAS ENTITY UPDATE DETAILS on GET method with Afghanistan as country field", async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [EntityKey]: {
          ...APPLICATION_DATA_MOCK[EntityKey],
          incorporation_country: "Afghanistan"
        }
      });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).toContain("Afghanistan");
    });

    test("catch error when renders the entity page on GET method", async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address in session`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).not.toHaveBeenCalled();
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address fetch`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const appData = getMockAppDataWithoutEmail();

      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "tester@test.com" });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(resp.text).toContain("tester@test.com");
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address fetch when no entity`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const appData = { ...APPLICATION_DATA_MOCK };
      appData.entity = undefined;
      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "tester@test.com" });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(resp.text).toContain("tester@test.com");
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address fetch returning nothing`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const appData = getMockAppDataWithoutEmail();

      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockGetPrivateOeDetails.mockReturnValueOnce(undefined);

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).toHaveBeenCalled();
      expect(resp.text).not.toContain("tester@test.com");
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address fetch returning no email`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const appData = getMockAppDataWithoutEmail();

      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockGetPrivateOeDetails.mockReturnValueOnce({ });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).toHaveBeenCalled();
      expect(resp.text).not.toContain("tester@test.com");
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address fetch returning empty email`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const appData = getMockAppDataWithoutEmail();

      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockGetPrivateOeDetails.mockReturnValueOnce({ email_address: "" });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).toHaveBeenCalled();
      expect(resp.text).not.toContain("tester@test.com");
    });

    test(`renders the OVERSEAS ENTITY UPDATE DETAILS page with email address fetch failing`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const appData = getMockAppDataWithoutEmail();

      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockGetPrivateOeDetails.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockGetPrivateOeDetails).toHaveBeenCalled();
      expect(resp.text).not.toContain("tester@test.com");
    });

  });

  describe("POST tests", () => {

    test("redirect to UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE page after a successful post from OVERSEAS ENTITY UPDATE DETAILS page when REDIS_flag is OFF", async () => {
      const appData = getMockAppDataWithoutEmail();
      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockPrepareData.mockReturnValueOnce(ENTITY_OBJECT_MOCK);
      mockIsActiveFeature.mockReturnValue(false);
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL)
        .send(UPDATE_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("redirect to UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE page after a successful post from OVERSEAS ENTITY UPDATE DETAILS page when REDIS_flag is ON", async () => {
      const appData = getMockAppDataWithoutEmail();
      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockPrepareData.mockReturnValueOnce(ENTITY_OBJECT_MOCK);
      mockIsActiveFeature.mockReturnValue(true);
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL)
        .send(UPDATE_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_WITH_PARAMS_URL);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with INVALID CHARACTERS error messages", async () => {
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL)
        .send(UPDATE_ENTITY_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_ENTITY_WITH_INVALID_CHARACTERS_FIELDS_MOCK.entity_name);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_JURISDICTION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS);
    });

    test("redirect to the next page page after a successful post from OVERSEAS ENTITY UPDATE DETAILS page without the register option", async () => {
      const appData = getMockAppDataWithoutEmail();
      mockFetchApplicationData.mockReturnValueOnce(appData);
      mockPrepareData.mockReturnValueOnce({ ...ENTITY_OBJECT_MOCK, [IsOnRegisterInCountryFormedInKey]: "", [EntityNumberKey]: COMPANY_NUMBER });
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL)
        .send(UPDATE_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);

      const data = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual('');
      expect(data[PublicRegisterJurisdictionKey]).toEqual('');
      expect(data[RegistrationNumberKey]).toEqual('');
    });

    test("catch error when post data from ENTITY page", async () => {
      mockSetApplicationData.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL)
        .send(UPDATE_ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("Navigation tests", () => {
    test(`Back links for follow on pages should return to ${config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL}`, async () => {
      expect(await NAVIGATION[config.UPDATE_CHECK_YOUR_ANSWERS_URL].previousPage()).toEqual(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
      expect(await NAVIGATION[config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL].previousPage()).toEqual(config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL);
    });
  });
});

function getMockAppDataWithoutEmail() {
  const appData = { ...APPLICATION_DATA_MOCK };
  appData.entity = { ...ENTITY_OBJECT_MOCK };
  appData.entity.email = undefined;
  return appData;
}
