jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/save.and.continue');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { ServiceAddressKey, ServiceAddressKeys } from "../../../src/model/address.model";
import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  UPDATE_LANDING_PAGE_URL,
  UPDATE_MANAGING_OFFICER_PAGE,
  UPDATE_MANAGING_OFFICER_URL,
  REMOVE
} from "../../../src/config";
import {
  getApplicationData,
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData
} from '../../../src/utils/application.data';
import {
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  MANAGING_OFFICER_OBJECT_MOCK,
  REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION,
  REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE,
  REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY,
  RR_CARRIAGE_RETURN,
  MO_IND_ID,
  MO_IND_ID_URL,
  APPLICATION_DATA_CH_REF_UPDATE_MOCK,
  APPLICATION_DATA_MOCK,
  REQ_BODY_UPDATE_MANAGING_OFFICER_INACTIVE
} from "../../__mocks__/session.mock";
import {
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
  ANY_MESSAGE_ERROR,
  ERROR_LIST,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  MANAGING_OFFICER,
  UPDATE_MANAGING_OFFICER_PAGE_TITLE,
  NOT_SHOW_MANAGING_OFFICER_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  SECOND_NATIONALITY,
  SECOND_NATIONALITY_HINT,
  SERVICE_UNAVAILABLE,
  MANAGING_OFFICER_PAGE_HEADING,
  SAVE_AND_CONTINUE_BUTTON_TEXT
} from '../../__mocks__/text.mock';
import { ApplicationDataType, managingOfficerType } from '../../../src/model';
import { ErrorMessages } from '../../../src/validation/error.messages';
import {
  AddressKeys,
  HasFormerNames,
  HasSameResidentialAddressKey
} from '../../../src/model/data.types.model';
import {
  MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK,
  MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../../__mocks__/validation.mock';
import { FormerNamesKey, ManagingOfficerIndividual, ManagingOfficerKey } from '../../../src/model/managing.officer.model';
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { DateTime } from "luxon";
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { logger } from "../../../src/utils/logger";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenterMiddleware = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };

describe("UPDATE MANAGING OFFICER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_MANAGING_OFFICER_INFORMATION_ON_PUBLIC_REGISTER);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page after all mandatory fields for ${UPDATE_MANAGING_OFFICER_PAGE} have been populated`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`sets session data and renders the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for valid active MO`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      const managingOfficer = mockSetApplicationData.mock.calls[0][1];

      expect(managingOfficer).toEqual(MANAGING_OFFICER_OBJECT_MOCK);
      expect(managingOfficer.first_name).toEqual("Joe");
      expect(managingOfficer.nationality).toEqual("Malawian");
      expect(managingOfficer.occupation).toEqual("Some Occupation");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerType.ManagingOfficerKey);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`sets session data and renders the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for valid inactive MO`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_INACTIVE);

      const managingOfficer = mockSetApplicationData.mock.calls[0][1];

      expect(managingOfficer).toEqual(MANAGING_OFFICER_OBJECT_MOCK);
      expect(managingOfficer.first_name).toEqual("Joe");
      expect(managingOfficer.nationality).toEqual("Malawian");
      expect(managingOfficer.occupation).toEqual("Some Occupation");
      expect(managingOfficer.start_date).toEqual(DUMMY_DATA_OBJECT);
      expect(managingOfficer.resigned_on).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerType.ManagingOfficerKey);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and redirect to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => { return { [HasSameResidentialAddressKey]: 0, [HasFormerNames]: 0 }; } );

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_URL} with error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.FORMER_NAME);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.OCCUPATION);
      expect(resp.text).toContain(ErrorMessages.ROLE_AND_RESPONSIBILITIES_INDIVIDUAL);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(UPDATE_MANAGING_OFFICER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_URL} with former names error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send({ has_former_names: "1", former_names: "       " });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME);
      expect(resp.text).toContain(ErrorMessages.FORMER_NAME);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_URL} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).toContain(ErrorMessages.MAX_FIRST_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAST_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_FORMER_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_OCCUPATION_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ROLE_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.FIRST_NAME);
      expect(resp.text).not.toContain(ErrorMessages.LAST_NAME);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.FORMER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.NATIONALITY);
      expect(resp.text).not.toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).not.toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).not.toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).not.toContain(ErrorMessages.COUNTRY);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS);
    });

    test("renders the current page with INVALID_CHARACTERS error message", async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.FORMER_NAMES_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.OCCUPATION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
    });

    test("renders the current page with INVALID_CHARACTERS service address error message", async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
    });

    test("renders the current page with no INVALID_CHARACTERS error message for text box containing carriage return", async () => {
      const carriageReturnMock = { ...MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK };
      carriageReturnMock["role_and_responsibilities"] = RR_CARRIAGE_RETURN;

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(carriageReturnMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`Former names data from the ${UPDATE_MANAGING_OFFICER_PAGE} is empty when has former names is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("John Doe");
    });

    test(`Former names data from the ${UPDATE_MANAGING_OFFICER_PAGE} is empty when when has former names is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("");
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only ENTER_DATE_OF_BIRTH error error when date of birth is completely empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month and year are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "01";
      managingOfficer["date_of_birth-month"] = "";
      managingOfficer["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day and year are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "";
      managingOfficer["date_of_birth-month"] = "01";
      managingOfficer["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day and month are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "";
      managingOfficer["date_of_birth-month"] = "";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only DAY_OF_BIRTH error error when date of birth day is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-month"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only MONTH_OF_BIRTH error error when date of birth month is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only YEAR_OF_BIRTH error error when date of birth year is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "06";
      managingOfficer["date_of_birth-month"] = "02";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when date is outside valid numbers`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "31";
      managingOfficer["date_of_birth-month"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month is outside valid numbers`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "13";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day is zero`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "0";
      managingOfficer["date_of_birth-month"] = "12";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month is zero`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "0";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only YEAR_LENGTH error when year is not 4 digits`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "10";
      managingOfficer["date_of_birth-year"] = "20";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when invalid characters are used`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "a";
      managingOfficer["date_of_birth-month"] = "b";
      managingOfficer["date_of_birth-year"] = "c";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when invalid date is used`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "35";
      managingOfficer["date_of_birth-month"] = "15";
      managingOfficer["date_of_birth-year"] = "2022";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only DATE_NOT_IN_PAST error when date of birth is in the future`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const today = DateTime.now().plus({ days: 1 });
      managingOfficer["date_of_birth-day"] = today.day.toString();
      managingOfficer["date_of_birth-month"] = today.month.toString();
      managingOfficer["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with only DATE_NOT_IN_PAST error when date of birth is today`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const today = DateTime.now();
      managingOfficer["date_of_birth-day"] = today.day.toString();
      managingOfficer["date_of_birth-month"] = today.month.toString();
      managingOfficer["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} page with error if Start date before DOB`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "1";
      managingOfficer["date_of_birth-month"] = "1";
      managingOfficer["date_of_birth-year"] = "1960";
      managingOfficer["start_date-day"] = "1";
      managingOfficer["start_date-month"] = "1";
      managingOfficer["start_date-year"] = "1959";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.START_DATE_MUST_BE_AFTER_DOB);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} page without error if Start date same as DOB`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "1";
      managingOfficer["date_of_birth-month"] = "1";
      managingOfficer["date_of_birth-year"] = "1960";
      managingOfficer["start_date-day"] = "1";
      managingOfficer["start_date-month"] = "1";
      managingOfficer["start_date-year"] = "1960";
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.START_DATE_MUST_BE_AFTER_DOB);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with second nationality error when same as nationality`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "Citizen of the Dominican Republic",
        second_nationality: "Citizen of the Dominican Republic"
      };
      const resp = await request(app).post(UPDATE_MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
      expect(resp.text).not.toContain(ErrorMessages.NATIONALITIES_TOO_LONG);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} with second nationality error when too long`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "Citizen of the Dominican Republic",
        second_nationality: "Citizen of Antigua and Barbuda"
      };
      const resp = await request(app).post(UPDATE_MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGING_OFFICER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.NATIONALITIES_TOO_LONG);
      expect(resp.text).not.toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("GET BY ID tests", () => {
    test(`renders ${UPDATE_MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_CH_REF_UPDATE_MOCK });

      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain("some first name");
    });

    test(`catch error when rendering the ${UPDATE_MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
  describe("UPDATE tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      const newMoData: ManagingOfficerIndividual = { id: MO_IND_ID, first_name: "new name" };
      mockPrepareData.mockReturnValueOnce(newMoData);
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(MO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(ManagingOfficerKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES );
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${UPDATE_MANAGING_OFFICER_PAGE} is empty when has former names is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("John Doe");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${UPDATE_MANAGING_OFFICER_PAGE} is empty when when has former names is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_PAGE} + ${MO_IND_ID_URL} with second nationality error when same as nationality`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(UPDATE_MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });
});
