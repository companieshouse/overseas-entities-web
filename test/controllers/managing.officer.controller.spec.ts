jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/feature.flag" );
jest.mock("../../src/utils/url");

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  BENEFICIAL_OWNER_TYPE_URL,
  LANDING_PAGE_URL,
  MANAGING_OFFICER_PAGE,
  MANAGING_OFFICER_URL,
  REMOVE,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  MANAGING_OFFICER_WITH_PARAMS_URL,
  BENEFICIAL_OWNER_TYPE_PAGE
} from "../../src/config";
import {
  getApplicationData,
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData
} from '../../src/utils/application.data';
import {
  APPLICATION_DATA_MOCK,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  MANAGING_OFFICER_OBJECT_MOCK,
  MO_IND_ID,
  MO_IND_ID_URL,
  REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION,
  REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS,
  REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY,
  RR_CARRIAGE_RETURN,
} from "../__mocks__/session.mock";
import {
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
  ANY_MESSAGE_ERROR,
  ERROR_LIST,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  MANAGING_OFFICER,
  MANAGING_OFFICER_PAGE_HEADING,
  NOT_SHOW_MANAGING_OFFICER_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SECOND_NATIONALITY,
  SECOND_NATIONALITY_HINT,
  SERVICE_UNAVAILABLE,
  BACK_BUTTON_CLASS
} from '../__mocks__/text.mock';
import { ApplicationDataType, managingOfficerType } from '../../src/model';
import { ErrorMessages } from '../../src/validation/error.messages';
import {
  AddressKeys,
  EntityNumberKey,
  HasFormerNames,
  HasSameResidentialAddressKey
} from '../../src/model/data.types.model';
import {
  MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK,
  MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../__mocks__/validation.mock';
import { logger } from "../../src/utils/logger";
import { FormerNamesKey, ManagingOfficerIndividual, ManagingOfficerKey } from '../../src/model/managing.officer.model';
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { DateTime } from "luxon";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();
const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

describe("MANAGING_OFFICER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
    mockIsActiveFeature.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_MANAGING_OFFICER_INFORMATION_ON_PUBLIC_REGISTER);
    });
  });

  describe("GET with url params tests", () => {

    test(`renders the ${MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_MANAGING_OFFICER_INFORMATION_ON_PUBLIC_REGISTER);
    });
  });

  describe("GET BY ID tests", () => {

    test("renders the managing officer page", async () => {
      const moMock = { ...MANAGING_OFFICER_OBJECT_MOCK };
      const appData = {
        ...APPLICATION_DATA_MOCK,
        [ManagingOfficerKey]: [moMock],
        [EntityNumberKey]: undefined,
      };
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetFromApplicationData.mockReturnValueOnce(moMock);
      const resp = await request(app).get(MANAGING_OFFICER_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).toContain("Malawian");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(MANAGING_OFFICER_URL);
    });

    test("catch error when rendering the page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("GET BY ID with url params tests", () => {

    test("renders the managing officer page", async () => {
      const moMock = { ...MANAGING_OFFICER_OBJECT_MOCK };
      const appData = {
        ...APPLICATION_DATA_MOCK,
        [ManagingOfficerKey]: [moMock],
        [EntityNumberKey]: undefined,
      };
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetFromApplicationData.mockReturnValueOnce(moMock);
      const resp = await request(app).get(MANAGING_OFFICER_WITH_PARAMS_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).toContain("Malawian");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(MANAGING_OFFICER_URL);
    });

    test("catch error when rendering the page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_WITH_PARAMS_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`renders the ${BENEFICIAL_OWNER_TYPE_URL} page after all mandatory fields for ${MANAGING_OFFICER_URL} have been populated`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page after all mandatory fields for ${MANAGING_OFFICER_URL} have been populated`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(MANAGING_OFFICER_OBJECT_MOCK);
      expect(beneficialOwnerIndividual.first_name).toEqual("Joe");
      expect(beneficialOwnerIndividual.nationality).toEqual("Malawian");
      expect(beneficialOwnerIndividual.occupation).toEqual("Some Occupation");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerType.ManagingOfficerKey);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => { return { [HasSameResidentialAddressKey]: 0, [HasFormerNames]: 0 }; } );

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_URL} with error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
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
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(MANAGING_OFFICER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_URL} with former names error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send({ has_former_names: "1", former_names: "       " });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME);
      expect(resp.text).toContain(ErrorMessages.FORMER_NAME);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_URL} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with INVALID_CHARACTERS error message", async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with INVALID_CHARACTERS service address error message", async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with no INVALID_CHARACTERS error message for text box containing carriage return", async () => {
      const carriageReturnMock = { ...MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK };
      carriageReturnMock["role_and_responsibilities"] = RR_CARRIAGE_RETURN;

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(carriageReturnMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when has former names is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("John Doe");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when when has former names is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only ENTER_DATE_OF_BIRTH error error when date of birth is completely empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month and year are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "01";
      managingOfficer["date_of_birth-month"] = "";
      managingOfficer["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day and year are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "";
      managingOfficer["date_of_birth-month"] = "01";
      managingOfficer["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day and month are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "";
      managingOfficer["date_of_birth-month"] = "";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only DAY_OF_BIRTH error error when date of birth day is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-month"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only MONTH_OF_BIRTH error error when date of birth month is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only YEAR_OF_BIRTH error error when date of birth year is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "06";
      managingOfficer["date_of_birth-month"] = "02";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when date is outside valid numbers`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "31";
      managingOfficer["date_of_birth-month"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month is outside valid numbers`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "13";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day is zero`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "0";
      managingOfficer["date_of_birth-month"] = "12";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month is zero`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "0";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only YEAR_LENGTH error when year is not 4 digits`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "10";
      managingOfficer["date_of_birth-year"] = "20";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when invalid characters are used`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "a";
      managingOfficer["date_of_birth-month"] = "b";
      managingOfficer["date_of_birth-year"] = "c";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when invalid date is used`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "35";
      managingOfficer["date_of_birth-month"] = "15";
      managingOfficer["date_of_birth-year"] = "2022";
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only DATE_NOT_IN_PAST error when date of birth is in the future`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const today = DateTime.now().plus({ days: 1 });
      managingOfficer["date_of_birth-day"] = today.day.toString();
      managingOfficer["date_of_birth-month"] = today.month.toString();
      managingOfficer["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only DATE_NOT_IN_PAST error when date of birth is today`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const today = DateTime.now();
      managingOfficer["date_of_birth-day"] = today.day.toString();
      managingOfficer["date_of_birth-month"] = today.month.toString();
      managingOfficer["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with second nationality error when same as nationality`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "Citizen of the Dominican Republic",
        second_nationality: "Citizen of the Dominican Republic"
      };
      const resp = await request(app).post(MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
      expect(resp.text).not.toContain(ErrorMessages.NATIONALITIES_TOO_LONG);
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with second nationality error when too long`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "Citizen of the Dominican Republic",
        second_nationality: "Citizen of Antigua and Barbuda"
      };
      const resp = await request(app).post(MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.NATIONALITIES_TOO_LONG);
      expect(resp.text).not.toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("POST with url params tests", () => {
    test(`redirects to ${BENEFICIAL_OWNER_TYPE_PAGE} page after all mandatory fields for ${MANAGING_OFFICER_PAGE} have been populated`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test(`sets session data and renders the ${BENEFICIAL_OWNER_TYPE_PAGE} page after all mandatory fields for ${MANAGING_OFFICER_PAGE} have been populated`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(MANAGING_OFFICER_OBJECT_MOCK);
      expect(beneficialOwnerIndividual.first_name).toEqual("Joe");
      expect(beneficialOwnerIndividual.nationality).toEqual("Malawian");
      expect(beneficialOwnerIndividual.occupation).toEqual("Some Occupation");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerType.ManagingOfficerKey);
      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockImplementationOnce( () => { return { [HasSameResidentialAddressKey]: 0, [HasFormerNames]: 0 }; } );

      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
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
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(MANAGING_OFFICER_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with former names error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send({ has_former_names: "1", former_names: "       " });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_INDIVIDUAL_PERSON_HAS_FORMER_NAME);
      expect(resp.text).toContain(ErrorMessages.FORMER_NAME);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_URL} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with INVALID_CHARACTERS error message", async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with INVALID_CHARACTERS service address error message", async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with no INVALID_CHARACTERS error message for text box containing carriage return", async () => {
      const carriageReturnMock = { ...MANAGING_OFFICER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK };
      carriageReturnMock["role_and_responsibilities"] = RR_CARRIAGE_RETURN;

      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(carriageReturnMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when has former names is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES);
      await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("John Doe");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when when has former names is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO);
      await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only ENTER_DATE_OF_BIRTH error error when date of birth is completely empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month and year are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "01";
      managingOfficer["date_of_birth-month"] = "";
      managingOfficer["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day and year are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "";
      managingOfficer["date_of_birth-month"] = "01";
      managingOfficer["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day and month are empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "";
      managingOfficer["date_of_birth-month"] = "";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only DAY_OF_BIRTH error error when date of birth day is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-month"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
    // new tests
    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only MONTH_OF_BIRTH error error when date of birth month is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only YEAR_OF_BIRTH error error when date of birth year is empty`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "06";
      managingOfficer["date_of_birth-month"] = "02";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when date is outside valid numbers`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "31";
      managingOfficer["date_of_birth-month"] = "06";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month is outside valid numbers`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "13";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when day is zero`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "0";
      managingOfficer["date_of_birth-month"] = "12";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when month is zero`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "0";
      managingOfficer["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only YEAR_LENGTH error when year is not 4 digits`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "30";
      managingOfficer["date_of_birth-month"] = "10";
      managingOfficer["date_of_birth-year"] = "20";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when invalid characters are used`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "a";
      managingOfficer["date_of_birth-month"] = "b";
      managingOfficer["date_of_birth-year"] = "c";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only INVALID_DATE_OF_BIRTH error when invalid date is used`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      managingOfficer["date_of_birth-day"] = "35";
      managingOfficer["date_of_birth-month"] = "15";
      managingOfficer["date_of_birth-year"] = "2022";
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only DATE_NOT_IN_PAST error when date of birth is in the future`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const today = DateTime.now().plus({ days: 1 });
      managingOfficer["date_of_birth-day"] = today.day.toString();
      managingOfficer["date_of_birth-month"] = today.month.toString();
      managingOfficer["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with only DATE_NOT_IN_PAST error when date of birth is today`, async () => {
      const managingOfficer = { ...REQ_BODY_MANAGING_OFFICER_FOR_DATE_VALIDATION };
      const today = DateTime.now();
      managingOfficer["date_of_birth-day"] = today.day.toString();
      managingOfficer["date_of_birth-month"] = today.month.toString();
      managingOfficer["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_WITH_PARAMS_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with second nationality error when same as nationality`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "Citizen of the Dominican Republic",
        second_nationality: "Citizen of the Dominican Republic"
      };
      const resp = await request(app).post(MANAGING_OFFICER_WITH_PARAMS_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
      expect(resp.text).not.toContain(ErrorMessages.NATIONALITIES_TOO_LONG);
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} with second nationality error when too long`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "Citizen of the Dominican Republic",
        second_nationality: "Citizen of Antigua and Barbuda"
      };
      const resp = await request(app).post(MANAGING_OFFICER_WITH_PARAMS_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.NATIONALITIES_TOO_LONG);
      expect(resp.text).not.toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      const newMoData: ManagingOfficerIndividual = { id: MO_IND_ID, first_name: "new name" };
      mockPrepareData.mockReturnValueOnce(newMoData);
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(MO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(ManagingOfficerKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES );
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when has former names is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("John Doe");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when when has former names is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} + ${MO_IND_ID_URL} with second nationality error when same as nationality`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("UPDATE with url params tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const newMoData: ManagingOfficerIndividual = { id: MO_IND_ID, first_name: "new name" };
      mockPrepareData.mockReturnValueOnce(newMoData);
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(MO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(ManagingOfficerKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES );
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when has former names is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_YES);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("John Doe");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Former names data from the ${MANAGING_OFFICER_PAGE} is empty when when has former names is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_INDIVIDUAL_OBJECT_MOCK_WITH_FORMER_NAMES_NO);
      await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[FormerNamesKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`renders the current page ${MANAGING_OFFICER_PAGE} + ${MO_IND_ID_URL} with second nationality error when same as nationality`, async () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(MANAGING_OFFICER_URL).send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("REMOVE with url params tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_WITH_PARAMS_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_WITH_PARAMS_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      const resp = await request(app).get(MANAGING_OFFICER_WITH_PARAMS_URL + REMOVE + MO_IND_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });
  });
});
