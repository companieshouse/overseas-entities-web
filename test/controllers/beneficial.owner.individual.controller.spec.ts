jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  BENEFICIAL_OWNER_INDIVIDUAL_URL,
  BENEFICIAL_OWNER_TYPE_PAGE,
  BENEFICIAL_OWNER_TYPE_URL,
  REMOVE
} from "../../src/config";
import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  getApplicationData
} from '../../src/utils/application.data';
import { saveAndContinue } from "../../src/utils/save.and.continue";
import {
  ANY_MESSAGE_ERROR,
  BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING,
  BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT,
  ERROR_LIST,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SECOND_NATIONALITY,
  SECOND_NATIONALITY_HINT,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  NOT_SHOW_BENEFICIAL_OWNER_INFORMATION_ON_PUBLIC_REGISTER,
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
  UK_SANCTIONS_DETAILS,
  YES_SANCTIONS_TEXT_THEY,
  NO_SANCTIONS_TEXT_THEY,
  SANCTIONS_HINT_TEXT_THEY,
  TRUSTS_NOC_HEADING,
} from '../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS,
  BENEFICIAL_OWNER_INDIVIDUAL_REPLACE,
  BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH,
  BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE,
  BO_IND_ID,
  BO_IND_ID_URL,
  REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY,
} from '../__mocks__/session.mock';
import { BeneficialOwnerIndividualKey } from '../../src/model/beneficial.owner.individual.model';
import { AddressKeys, EntityNumberKey } from '../../src/model/data.types.model';
import {
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../__mocks__/validation.mock';
import { ErrorMessages } from '../../src/validation/error.messages';
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import { ApplicationDataType } from '../../src/model';
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import * as config from "../../src/config";
import { DateTime } from "luxon";

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

describe("BENEFICIAL OWNER INDIVIDUAL controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {
    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_BENEFICIAL_OWNER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(UK_SANCTIONS_DETAILS);
      expect(resp.text).toContain(YES_SANCTIONS_TEXT_THEY);
      expect(resp.text).toContain(NO_SANCTIONS_TEXT_THEY);
      expect(resp.text).toContain(SANCTIONS_HINT_TEXT_THEY);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
    });
  });

  describe("GET BY ID tests", () => {
    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain("Ivan");
      expect(resp.text).toContain("Drago");
      expect(resp.text).toContain("Russian");
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
    });

    test("catch error when rendering the page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and do not redirect to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => { return BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS; } );
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirect to the ${BENEFICIAL_OWNER_TYPE_PAGE} page after a successful post from ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with service address data`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO );
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST empty object and do not redirect to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY );

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.header.location).not.toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`adds data to the session and redirects to the ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerIndividualKey);
      expect(resp.status).toEqual(302);

      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.MAX_FIRST_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_LAST_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with INVALID_CHARACTERS error message`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.FIRST_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAST_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with INVALID_CHARACTERS service address error message`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);

      expect(resp.text).toContain( ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain( ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain( ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain( ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain( ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain( ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER DATE error when start date is completely empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "01";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "01";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "22";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "32";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date month is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "13";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing DAY error when start date day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "00";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing MONTH error when start date month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "00";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing YEAR error when start date year is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "00";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`leading zeros are stripped from start date`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );
      const beneficialOwnerGov = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      beneficialOwnerGov["start_date-day"] = "0030";
      beneficialOwnerGov["start_date-month"] = "0011";
      beneficialOwnerGov["start_date-year"] = "001234";
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(302);

      const reqBody = mockPrepareData.mock.calls[0][0];
      expect(reqBody["start_date-day"]).toEqual("30");
      expect(reqBody["start_date-month"]).toEqual("11");
      expect(reqBody["start_date-year"]).toEqual("1234");
    });

    test(`leading zeros are stripped from date of birth`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );
      const beneficialOwnerGov = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      beneficialOwnerGov["date_of_birth-day"] = "0030";
      beneficialOwnerGov["date_of_birth-month"] = "0011";
      beneficialOwnerGov["date_of_birth-year"] = "001234";
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(302);

      const reqBody = mockPrepareData.mock.calls[0][0];
      expect(reqBody["date_of_birth-day"]).toEqual("30");
      expect(reqBody["date_of_birth-month"]).toEqual("11");
      expect(reqBody["date_of_birth-year"]).toEqual("1234");
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when start_date is in the future`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["start_date-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const today = DateTime.now();
      beneficialOwnerOther["start_date-day"] = today.day.toString();
      beneficialOwnerOther["start_date-month"] = today.month.toString();
      beneficialOwnerOther["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when start date year is not 4 digits`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "10";
      beneficialOwnerIndividual["start_date-year"] = "20";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER_DATE_OF_BIRTH error when date of birth is completely empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "01";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "01";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day and month are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DAY_OF_BIRTH error error when date of birth day is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "01";
      beneficialOwnerIndividual["date_of_birth-year"] = "2023";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only MONTH_OF_BIRTH error error when date of birth month is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "01";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "2023";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_OF_BIRTH error error when date of birth year is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "11";
      beneficialOwnerIndividual["date_of_birth-month"] = "03";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "32";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day is outside valid numbers with leading zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "0032";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "13";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month is outside valid numbers with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "0013";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing DAY error when date of birth day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "00";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing MONTH error when date of birth month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "00";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing YEAR error when date of birth year is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "0000";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST error when date of birth is in the future`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["date_of_birth-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["date_of_birth-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["date_of_birth-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST error when date of birth is today`, async () => {
      const beneficialOwnerOther = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const today = DateTime.now();
      beneficialOwnerOther["date_of_birth-day"] = today.day.toString();
      beneficialOwnerOther["date_of_birth-month"] = today.month.toString();
      beneficialOwnerOther["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerOther);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when date of birth year is not 4 digits`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "11";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "70";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.DATE_OF_BIRTH_YEAR_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with second nationality error when same as nationality`, async () => {
      const beneficialOwnerIndividual = {
        ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_REPLACE);
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REPLACE);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerIndividualKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_IND_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerIndividualKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`renders the page ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} + ${BO_IND_ID_URL} with second nationality error when same as nationality`, async () => {
      const beneficialOwnerIndividual = {
        ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL + REMOVE + BO_IND_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when removing data", async () => {
      mockRemoveFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL + REMOVE + BO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled(); // TODO: testing
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL + REMOVE + BO_IND_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerIndividualKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_IND_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
