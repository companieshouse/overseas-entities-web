jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { DateTime } from "luxon";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import * as config from "../../src/config";
import { logger } from "../../src/utils/logger";
import { ApplicationDataType } from '../../src/model';
import { ErrorMessages } from "../../src/validation/error.messages";
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";

import { getUrlWithParamsToPath, isRegistrationJourney } from "../../src/utils/url";
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";

import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  getApplicationData,
  fetchApplicationData,
} from '../../src/utils/application.data';

import {
  BENEFICIAL_OWNER_GOV_PAGE_HEADING,
  ERROR_LIST,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  MESSAGE_ERROR,
  NO_SANCTIONS_TEXT_IT,
  PAGE_TITLE_ERROR,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE,
  SHOW_INFORMATION_ON_PUBLIC_REGISTER,
  UK_SANCTIONS_DETAILS,
  YES_SANCTIONS_TEXT_IT,
  SANCTIONS_HINT_TEXT_IT,
  TRUSTS_NOC_HEADING,
  BO_NOC_HEADING,
  FIRM_NOC_HEADING,
  FIRM_CONTROL_NOC_HEADING,
  TRUST_CONTROL_NOC_HEADING,
  OWNER_OF_LAND_PERSON_NOC_HEADING,
  OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING
} from "../__mocks__/text.mock";

import {
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY,
  BO_GOV_ID,
  BO_GOV_ID_URL,
  REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION,
  APPLICATION_DATA_MOCK,
} from "../__mocks__/session.mock";

import {
  AddressKeys,
  EntityNumberKey,
  BeneficialOwnerNoc,
  TrustControlNoc,
  NatureOfControlJurisdiction,
  NatureOfControlType,
  NonLegalFirmControlNoc,
  OwnerOfLandOtherEntityJurisdictionsNoc,
  OwnerOfLandPersonJurisdictionsNoc
} from '../../src/model/data.types.model';

import {
  BENEFICIAL_OWNER_GOV_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  BENEFICIAL_OWNER_GOV_WITH_MAX_LENGTH_FIELDS_MOCK
} from "../__mocks__/validation.mock";

mockCsrfProtectionMiddleware.mockClear();
const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };
const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

describe("BENEFICIAL OWNER GOV controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockMapFieldsToDataObject.mockReset();
    mockIsActiveFeature.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(UK_SANCTIONS_DETAILS);
      expect(resp.text).toContain(YES_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(NO_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(SANCTIONS_HINT_TEXT_IT);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page renders natures of control correctly when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is active`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING);
      expect(resp.text).toContain(FIRM_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });
  });

  describe("GET with url params tests", () => {

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(UK_SANCTIONS_DETAILS);
      expect(resp.text).toContain(YES_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(NO_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(SANCTIONS_HINT_TEXT_IT);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page natures of control correctly when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is active`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING);
      expect(resp.text).toContain(FIRM_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });
  });

  describe("GET BY ID tests", () => {

    test("renders the beneficial owner gov page", async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockFetchApplicationData.mockReturnValue(applicationDataMock);

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain("my company name");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("LegalForm");
      expect(resp.text).toContain("a11");
      expect(resp.text).toContain("name=\"is_on_sanctions_list\" type=\"radio\" value=\"1\" checked");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("Should render the error page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("GET BY ID with url params tests", () => {

    test("renders the beneficial owner gov page", async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain("my company name");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("LegalForm");
      expect(resp.text).toContain("a11");
      expect(resp.text).toContain("name=\"is_on_sanctions_list\" type=\"radio\" value=\"1\" checked");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("Should render the error page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page when the REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValue(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page when the REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`correctly maps natures of control when feature flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
      mockPrepareData.mockImplementationOnce(() => {
        return {
          ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          trust_control_nature_of_control_types: [NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL],
          non_legal_firm_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
          owner_of_land_person_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.ENGLAND_AND_WALES],
          owner_of_land_other_entity_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.NORTHERN_IRELAND]
        };
      });

      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send({
          ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
        });

      const appData: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];

      expect(appData[BeneficialOwnerNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS]);
      expect(appData[TrustControlNoc]).toEqual([NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL]);
      expect(appData[NonLegalFirmControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(appData[OwnerOfLandPersonJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.ENGLAND_AND_WALES]);
      expect(appData[OwnerOfLandOtherEntityJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.NORTHERN_IRELAND]);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and do not redirect to ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce(() => REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY);

      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LEGAL_FORM_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAW_GOVERNED_LENGTH);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with INVALID CHARACTERS error messages`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with error messages`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.BO_GOV_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only ENTER DATE error when start date is completely empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "01";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "01";
      beneficialOwnerGov["start_date-year"] = "";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "01";
      beneficialOwnerGov["start_date-month"] = "06";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when date is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "31";
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when month is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "30";
      beneficialOwnerGov["start_date-month"] = "13";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when day is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "0";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when month is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "30";
      beneficialOwnerGov["start_date-month"] = "0";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only YEAR_LENGTH error when invalid characters are used`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "a";
      beneficialOwnerGov["start_date-month"] = "b";
      beneficialOwnerGov["start_date-year"] = "c";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when invalid date is used`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "11";
      beneficialOwnerGov["start_date-month"] = "33";
      beneficialOwnerGov["start_date-year"] = "2022";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only YEAR_LENGTH error when year length is not 4 digits`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "10";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "20";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only DATE_NOT_IN_PAST_OR_TODAY error when start date is not in the past`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerGov["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerGov["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerGov["start_date-year"] = inTheFuture.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const today = DateTime.now();
      beneficialOwnerGov["start_date-day"] = today.day.toString();
      beneficialOwnerGov["start_date-month"] = today.month.toString();
      beneficialOwnerGov["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    describe("Nature of control tests", () => {

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null],
        ["Non legal firm Noc", null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]]
      ])(`redirect to the ${config.BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF - %s`, async (_desc, boNoc, nonLegalNoc) => {
        mockPrepareData.mockImplementationOnce(() => ({ ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS }));

        const body = {
          ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          beneficial_owner_nature_of_control_types: boNoc,
          non_legal_firm_members_nature_of_control_types: nonLegalNoc
        };

        const resp = await request(app)
          .post(config.BENEFICIAL_OWNER_GOV_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      });

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null, null],
        ["Trust control control Noc", null, [NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL], null, null, null],
        ["Non legal firm control Noc", null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null],
        ["Owner of land person Noc", null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES], null],
        ["Owner of land other entity Noc", null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES]]
      ])(`redirect to the ${config.BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON - %s`, async (_desc, boNoc, trustControlNoc, nonLegalFirmControlNoc, landPersonNoc, landOtherEntityNoc) => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockPrepareData.mockImplementationOnce(() => ({ ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS }));

        const body = {
          ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          beneficial_owner_nature_of_control_types: boNoc,
          non_legal_firm_members_nature_of_control_types: null,
          trust_control_nature_of_control_types: trustControlNoc,
          non_legal_firm_control_nature_of_control_types: nonLegalFirmControlNoc,
          owner_of_land_person_nature_of_control_jurisdictions: landPersonNoc,
          owner_of_land_other_entity_nature_of_control_jurisdictions: landOtherEntityNoc
        };

        const resp = await request(app)
          .post(config.BENEFICIAL_OWNER_GOV_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      });

      test(`correctly maps natures of control when feature flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
        mockPrepareData.mockImplementationOnce(() => {
          return {
            ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
            non_legal_firm_members_nature_of_control_types: null,
            trust_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
            non_legal_firm_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
            owner_of_land_person_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.ENGLAND_AND_WALES],
            owner_of_land_other_entity_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.NORTHERN_IRELAND]
          };
        });

        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        await request(app)
          .post(config.BENEFICIAL_OWNER_GOV_URL)
          .send({
            ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          });

        const appData: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];

        expect(appData[TrustControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
        expect(appData[NonLegalFirmControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
        expect(appData[OwnerOfLandPersonJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.ENGLAND_AND_WALES]);
        expect(appData[OwnerOfLandOtherEntityJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.NORTHERN_IRELAND]);
      });

      test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with nature of control error when no nature of control is provided and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        const beneficialOwnerGov = {
          ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: null,
          trust_control_nature_of_control_types: null,
          non_legal_firm_members_nature_of_control_types: null,
          non_legal_firm_control_nature_of_control_types: null,
          owner_of_land_person_nature_of_control_jurisdictions: null,
          owner_of_land_other_entity_nature_of_control_jurisdictions: null
        };

        const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL)
          .send(beneficialOwnerGov);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
        expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      });

      test(`Renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with validation errors with correct nature of controls with FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

        const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
        expect(resp.text).toContain(BO_NOC_HEADING);
        expect(resp.text).toContain(FIRM_NOC_HEADING);
        expect(resp.text).not.toContain(FIRM_CONTROL_NOC_HEADING);
        expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
        expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
        expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
      });
    });
  });

  describe("POST with url params tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and do not redirect to ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce(() => REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY);

      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LEGAL_FORM_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAW_GOVERNED_LENGTH);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with INVALID CHARACTERS error messages`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with error messages`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.BO_GOV_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only ENTER DATE error when start date is completely empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "01";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "01";
      beneficialOwnerGov["start_date-year"] = "";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "01";
      beneficialOwnerGov["start_date-month"] = "06";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when date is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "31";
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when month is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "30";
      beneficialOwnerGov["start_date-month"] = "13";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when day is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "0";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when month is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "30";
      beneficialOwnerGov["start_date-month"] = "0";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only YEAR_LENGTH error when invalid characters are used`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "a";
      beneficialOwnerGov["start_date-month"] = "b";
      beneficialOwnerGov["start_date-year"] = "c";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only INVALID_DATE error when invalid date is used`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "11";
      beneficialOwnerGov["start_date-month"] = "33";
      beneficialOwnerGov["start_date-year"] = "2022";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only YEAR_LENGTH error when year length is not 4 digits`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "10";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "20";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with only DATE_NOT_IN_PAST_OR_TODAY error when start date is not in the past`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerGov["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerGov["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerGov["start_date-year"] = inTheFuture.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const today = DateTime.now();
      beneficialOwnerGov["start_date-day"] = today.day.toString();
      beneficialOwnerGov["start_date-month"] = today.month.toString();
      beneficialOwnerGov["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    describe("Nature of control tests", () => {

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null],
        ["Non legal firm Noc", null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]]
      ])(`redirect to the ${config.BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF - %s`, async (_desc, boNoc, nonLegalNoc) => {
        mockPrepareData.mockImplementationOnce(() => ({ ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS }));

        const body = {
          ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          beneficial_owner_nature_of_control_types: boNoc,
          non_legal_firm_members_nature_of_control_types: nonLegalNoc
        };

        const resp = await request(app)
          .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      });

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null, null],
        ["Trust control control Noc", null, [NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL], null, null, null],
        ["Non legal firm control Noc", null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null],
        ["Owner of land person Noc", null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES], null],
        ["Owner of land other entity Noc", null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES]]
      ])(`redirect to the ${config.BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON - %s`, async (_desc, boNoc, trustControlNoc, nonLegalFirmControlNoc, landPersonNoc, landOtherEntityNoc) => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        mockPrepareData.mockImplementationOnce(() => ({ ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS }));

        const body = {
          ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          beneficial_owner_nature_of_control_types: boNoc,
          non_legal_firm_members_nature_of_control_types: null,
          trust_control_nature_of_control_types: trustControlNoc,
          non_legal_firm_control_nature_of_control_types: nonLegalFirmControlNoc,
          owner_of_land_person_nature_of_control_jurisdictions: landPersonNoc,
          owner_of_land_other_entity_nature_of_control_jurisdictions: landOtherEntityNoc
        };

        const resp = await request(app)
          .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      });

      test(`correctly maps natures of control when feature flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
        mockPrepareData.mockImplementationOnce(() => {
          return {
            ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
            non_legal_firm_members_nature_of_control_types: null,
            trust_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
            non_legal_firm_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
            owner_of_land_person_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.ENGLAND_AND_WALES],
            owner_of_land_other_entity_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.NORTHERN_IRELAND]
          };
        });

        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        await request(app)
          .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
          .send({
            ...BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
          });

        const appData: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];

        expect(appData[TrustControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
        expect(appData[NonLegalFirmControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
        expect(appData[OwnerOfLandPersonJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.ENGLAND_AND_WALES]);
        expect(appData[OwnerOfLandOtherEntityJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.NORTHERN_IRELAND]);
      });

      test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with nature of control error when no nature of control is provided and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        const beneficialOwnerGov = {
          ...BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: null,
          trust_control_nature_of_control_types: null,
          non_legal_firm_members_nature_of_control_types: null,
          non_legal_firm_control_nature_of_control_types: null,
          owner_of_land_person_nature_of_control_jurisdictions: null,
          owner_of_land_other_entity_nature_of_control_jurisdictions: null
        };

        const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL)
          .send(beneficialOwnerGov);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
        expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      });

      test(`Renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with validation errors with correct nature of controls with FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

        const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);

        expect(resp.text).toContain(BO_NOC_HEADING);
        expect(resp.text).toContain(FIRM_NOC_HEADING);
        expect(resp.text).not.toContain(FIRM_CONTROL_NOC_HEADING);
        expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
        expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
        expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
      });
    });
  });

  describe("UPDATE tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page when the REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValue(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page when the REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      const newGovData: BeneficialOwnerGov = { id: BO_GOV_ID, name: "new name" };
      mockPrepareData.mockReturnValueOnce(newGovData);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerGovKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_GOV_ID);
      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_GOV_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerGovKey);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("UPDATE with url params tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} page with substituted ids`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockGetUrlWithParamsToPath).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const newGovData: BeneficialOwnerGov = { id: BO_GOV_ID, name: "new name" };
      mockPrepareData.mockReturnValueOnce(newGovData);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerGovKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_GOV_ID);
      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_GOV_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerGovKey);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation(() => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("REMOVE tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page hwnr the REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValue(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page hwnr the REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerGovKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_GOV_ID);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("REMOVE with url params tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL} page with substituted ids`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_WITH_PARAMS_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerGovKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_GOV_ID);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });
});
