jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");
jest.mock('../../src/utils/relevant.period');

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  BENEFICIAL_OWNER_OTHER_RADIO_BUTTONS_ONLY,
  BENEFICIAL_OWNER_OTHER_REPLACE,
  BENEFICIAL_OWNER_OTHER_REQ_BODY_MOCK_WITH_MISSING_SERVICE_ADDRESS,
  BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE,
  BO_OTHER_ID,
  BO_OTHER_ID_URL,
  REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY,
} from "../__mocks__/session.mock";
import {
  getFromApplicationData, mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  getApplicationData
} from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import app from "../../src/app";
import {
  BENEFICIAL_OWNER_OTHER_PAGE,
  BENEFICIAL_OWNER_OTHER_URL,
  BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL,
  BENEFICIAL_OWNER_TYPE_URL,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  REMOVE
} from "../../src/config";
import {
  BENEFICIAL_OWNER_OTHER_PAGE_HEADING,
  ERROR_LIST,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  JURISDICTION_FIELD_LABEL,
  MESSAGE_ERROR,
  NO_SANCTIONS_TEXT_IT,
  PAGE_TITLE_ERROR,
  PUBLIC_REGISTER_HINT_TEXT,
  SANCTIONS_HINT_TEXT_IT,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE,
  SHOW_INFORMATION_ON_PUBLIC_REGISTER,
  UK_SANCTIONS_DETAILS,
  YES_SANCTIONS_TEXT_IT,
  TRUSTS_NOC_HEADING,
} from "../__mocks__/text.mock";
import {
  AddressKeys,
  EntityNumberKey,
  IsOnSanctionsListKey,
  NatureOfControlType, PublicRegisterNameKey, RegistrationNumberKey,
  yesNoResponse
} from "../../src/model/data.types.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import {
  BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_MOCK,
  BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  BENEFICIAL_OWNER_OTHER_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../__mocks__/validation.mock';
import { ApplicationDataType } from "../../src/model";
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import { ErrorMessages } from "../../src/validation/error.messages";

import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import * as config from "../../src/config";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { DateTime } from "luxon";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath } from "../../src/utils/url";
import { checkRelevantPeriod } from "../../src/utils/relevant.period";

mockCsrfProtectionMiddleware.mockClear();
const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockCheckRelevantPeriod = checkRelevantPeriod as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const NEXT_PAGE_URL = "/NEXT_PAGE/";

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

describe("BENEFICIAL OWNER OTHER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
    mockIsActiveFeature.mockReset();
  });

  describe("GET tests", () => {

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(UK_SANCTIONS_DETAILS);
      expect(resp.text).toContain(YES_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(NO_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(SANCTIONS_HINT_TEXT_IT);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page without public register jurisdiction field`, async () => {
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(JURISDICTION_FIELD_LABEL);
      expect(resp.text).toContain(PUBLIC_REGISTER_HINT_TEXT);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });
  });

  describe("GET with url params tests", () => {

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(UK_SANCTIONS_DETAILS);
      expect(resp.text).toContain(YES_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(NO_SANCTIONS_TEXT_IT);
      expect(resp.text).toContain(SANCTIONS_HINT_TEXT_IT);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page without public register jurisdiction field`, async () => {
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(JURISDICTION_FIELD_LABEL);
      expect(resp.text).toContain(PUBLIC_REGISTER_HINT_TEXT);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });
  });

  describe("GET BY ID tests", () => {

    test("Renders the page through GET", async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);

      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain("TestCorporation");
      expect(resp.text).toContain("TheLaw");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("BY 2");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("Should render the error page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("GET BY ID with url params tests", () => {

    test("Renders the page through GET", async () => {
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL x 2
      mockGetFromApplicationData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS });
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);

      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL + BO_OTHER_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain("TestCorporation");
      expect(resp.text).toContain("TheLaw");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("BY 2");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(mockIsActiveFeature).toBeCalledTimes(2);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(config.BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
      expect(mockGetUrlWithParamsToPath.mock.calls[1][0]).toEqual(config.ACTIVE_SUBMISSION_BASE_PATH);
      const removePath = config.REGISTER_AN_OVERSEAS_ENTITY_URL + NEXT_PAGE_URL + config.BENEFICIAL_OWNER_OTHER_PAGE + config.REMOVE + BO_OTHER_ID_URL;
      expect(resp.text).toContain(removePath);
    });

    test("Should render the error page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL + BO_OTHER_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`Sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      const beneficialOwnerOtherMock = { ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK, [IsOnSanctionsListKey]: "0" };
      mockPrepareData.mockReturnValueOnce(beneficialOwnerOtherMock);
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      const beneficialOwnerOther = mockSetApplicationData.mock.calls[0][1];
      expect(beneficialOwnerOther.name).toEqual("TestCorporation");
      expect(beneficialOwnerOther.legal_form).toEqual("TheLegalForm");
      expect(beneficialOwnerOther.law_governed).toEqual("TheLaw");
      expect(beneficialOwnerOther.public_register_name).toEqual( "ThisRegister");
      expect(beneficialOwnerOther.registration_number).toEqual("123456789");
      expect(beneficialOwnerOther.is_on_register_in_country_formed_in).toEqual(yesNoResponse.Yes);
      expect(beneficialOwnerOther.beneficial_owner_nature_of_control_types).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS]);
      expect(beneficialOwnerOther.trustees_nature_of_control_types).toEqual([NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]);
      expect(beneficialOwnerOther.non_legal_firm_members_nature_of_control_types).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(beneficialOwnerOther[IsOnSanctionsListKey]).toEqual(yesNoResponse.No);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerOtherKey);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and do not redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_RADIO_BUTTONS_ONLY });

      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_RADIO_BUTTONS_ONLY);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and do not redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY });

      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("Catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
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
      expect(resp.text).toContain(ErrorMessages.MAX_PUBLIC_REGISTER_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PUBLIC_REGISTER_NUMBER_LENGTH);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with INVALID_CHARACTERS error message`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);

      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS);

      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with INVALID_CHARACTERS service address error message`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);

      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${BENEFICIAL_OWNER_OTHER_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO });
      await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      expect(mockMapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_OTHER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES });
      await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${BENEFICIAL_OWNER_OTHER_PAGE} is present when is on register set to yes`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES });
      await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("ThisRegister");
      expect(data[RegistrationNumberKey]).toEqual("123456789");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${BENEFICIAL_OWNER_OTHER_PAGE} is empty when is on register set to no`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO });
      await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only ENTER DATE error when start date is completely empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "02";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "02";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "2022";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "23";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "2022";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "11";
      beneficialOwnerOther["start_date-month"] = "4";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day is outside valid numbers`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "32";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only YEAR_LENGTH error when start date year is not 4 digits`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "30";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "20";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date month is outside valid numbers`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "30";
      beneficialOwnerOther["start_date-month"] = "13";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day is zero`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "0";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date month is zero`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "30";
      beneficialOwnerOther["start_date-month"] = "0";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when start date is in the future`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerOther["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerOther["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerOther["start_date-year"] = inTheFuture.year.toString();
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const today = DateTime.now();
      beneficialOwnerOther["start_date-day"] = today.day.toString();
      beneficialOwnerOther["start_date-month"] = today.month.toString();
      beneficialOwnerOther["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_OTHER_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with validation errors`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.BENEFICIAL_OWNER_OTHER_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_BENEFICIAL_OWNER_OTHER_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with service address validation errors`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL)
        .send(BENEFICIAL_OWNER_OTHER_REQ_BODY_MOCK_WITH_MISSING_SERVICE_ADDRESS);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });

  describe("POST with url params tests", () => {

    test(`Sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const beneficialOwnerOtherMock = { ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK, [IsOnSanctionsListKey]: "0" };
      mockPrepareData.mockReturnValueOnce(beneficialOwnerOtherMock);
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);

      const beneficialOwnerOther = mockSetApplicationData.mock.calls[0][1];
      expect(beneficialOwnerOther.name).toEqual("TestCorporation");
      expect(beneficialOwnerOther.legal_form).toEqual("TheLegalForm");
      expect(beneficialOwnerOther.law_governed).toEqual("TheLaw");
      expect(beneficialOwnerOther.public_register_name).toEqual( "ThisRegister");
      expect(beneficialOwnerOther.registration_number).toEqual("123456789");
      expect(beneficialOwnerOther.is_on_register_in_country_formed_in).toEqual(yesNoResponse.Yes);
      expect(beneficialOwnerOther.beneficial_owner_nature_of_control_types).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS]);
      expect(beneficialOwnerOther.trustees_nature_of_control_types).toEqual([NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]);
      expect(beneficialOwnerOther.non_legal_firm_members_nature_of_control_types).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(beneficialOwnerOther[IsOnSanctionsListKey]).toEqual(yesNoResponse.No);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerOtherKey);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test(`POST only radio buttons choices and do not redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_RADIO_BUTTONS_ONLY });

      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_RADIO_BUTTONS_ONLY);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and do not redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY });

      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(REQ_BODY_BENEFICIAL_OWNER_OTHER_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("Catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
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
      expect(resp.text).toContain(ErrorMessages.MAX_PUBLIC_REGISTER_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PUBLIC_REGISTER_NUMBER_LENGTH);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with INVALID_CHARACTERS error message`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);

      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS);

      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with INVALID_CHARACTERS service address error message`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);

      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${BENEFICIAL_OWNER_OTHER_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO });
      await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      expect(mockMapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_OTHER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES });
      await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${BENEFICIAL_OWNER_OTHER_PAGE} is present when is on register set to yes`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES });
      await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("ThisRegister");
      expect(data[RegistrationNumberKey]).toEqual("123456789");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${BENEFICIAL_OWNER_OTHER_PAGE} is empty when is on register set to no`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO });
      await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only ENTER DATE error when start date is completely empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "02";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "02";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "2022";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "23";
      beneficialOwnerOther["start_date-month"] = "";
      beneficialOwnerOther["start_date-year"] = "2022";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "11";
      beneficialOwnerOther["start_date-month"] = "4";
      beneficialOwnerOther["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day is outside valid numbers`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "32";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only YEAR_LENGTH error when start date year is not 4 digits`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "30";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "20";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date month is outside valid numbers`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "30";
      beneficialOwnerOther["start_date-month"] = "13";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date day is zero`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "0";
      beneficialOwnerOther["start_date-month"] = "11";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only INVALID_DATE error when start date month is zero`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerOther["start_date-day"] = "30";
      beneficialOwnerOther["start_date-month"] = "0";
      beneficialOwnerOther["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when start date is in the future`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerOther["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerOther["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerOther["start_date-year"] = inTheFuture.year.toString();
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_OTHER_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const today = DateTime.now();
      beneficialOwnerOther["start_date-day"] = today.day.toString();
      beneficialOwnerOther["start_date-month"] = today.month.toString();
      beneficialOwnerOther["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.IDENTITY_CHECK_DATE_NOT_WITHIN_PAST_3_MONTHS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with validation errors`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_OTHER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.BENEFICIAL_OWNER_OTHER_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_BENEFICIAL_OWNER_OTHER_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ON_SANCTIONS_LIST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Renders the ${BENEFICIAL_OWNER_OTHER_PAGE} page with service address validation errors`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_OTHER_REQ_BODY_MOCK_WITH_MISSING_SERVICE_ADDRESS);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });

  describe("UPDATE tests", () => {
    test(`Redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS });
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("Catch error when updating data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Replaces existing object on submit`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_REPLACE });
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_REPLACE);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerOtherKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_OTHER_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_OTHER_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerOtherKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_OTHER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO });
      await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      expect(mockMapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_OTHER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES });
      await request(app)
        .post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      expect(mockMapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${BENEFICIAL_OWNER_OTHER_PAGE} is present when is on register set to yes`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES });
      await request(app).post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("ThisRegister");
      expect(data[RegistrationNumberKey]).toEqual("123456789");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${BENEFICIAL_OWNER_OTHER_PAGE} is empty when is on register set to no`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO });
      await request(app).post(BENEFICIAL_OWNER_OTHER_URL + BO_OTHER_ID_URL)
        .send(BENEFICIAL_OWNER_OTHER_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("REMOVE tests", () => {
    test(`Redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce({ ...BENEFICIAL_OWNER_OTHER_BODY_OBJECT_MOCK_WITH_ADDRESS });
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL + REMOVE + BO_OTHER_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("Catch error when removing data", async () => {
      mockRemoveFromApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      mockCheckRelevantPeriod.mockReturnValueOnce(true);
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL + REMOVE + BO_OTHER_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Removes the object from session`, async () => {
      const resp = await request(app).get(BENEFICIAL_OWNER_OTHER_URL + REMOVE + BO_OTHER_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerOtherKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_OTHER_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
