import { DateTime } from "luxon";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');

import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import { authentication } from "../../src/middleware/authentication.middleware";
import app from "../../src/app";
import * as config from "../../src/config";
import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData
} from '../../src/utils/application.data';
import {
  BENEFICIAL_OWNER_GOV_PAGE_HEADING,
  ERROR_LIST,
  MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE
} from "../__mocks__/text.mock";
import { logger } from "../../src/utils/logger";
import {
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY,
  BO_GOV_ID,
  BO_GOV_ID_URL,
  REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION,
} from "../__mocks__/session.mock";
import { AddressKeys } from '../../src/model/data.types.model';
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import { ApplicationDataType } from '../../src/model';
import {
  BENEFICIAL_OWNER_GOV_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  BENEFICIAL_OWNER_GOV_WITH_MAX_LENGTH_FIELDS_MOCK
} from "../__mocks__/validation.mock";
import { ErrorMessages } from "../../src/validation/error.messages";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };

describe("BENEFICIAL OWNER GOV controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    });
  });

  describe("GET BY ID tests", () => {

    test("renders the beneficial owner gov page", async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);
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
    });

    test("Should render the error page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`POST empty object and do not redirect to ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY );

      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_GOV_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
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
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
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
    });

    test(`renders the ${config.BENEFICIAL_OWNER_GOV_PAGE} page with INVALID_DATE error when date is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] =  "31";
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with INVALID_DATE error when month is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] =  "30";
      beneficialOwnerGov["start_date-month"] = "13";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with INVALID_DATE error when day is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] =  "0";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with INVALID_DATE error when month is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] =  "30";
      beneficialOwnerGov["start_date-month"] = "0";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with INVALID_DATE error when invalid characters are used`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] =  "a";
      beneficialOwnerGov["start_date-month"] = "b";
      beneficialOwnerGov["start_date-year"] = "c";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.INVALID_DATE);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with YEAR_LENGTH error when year length is not 4 digits`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] =  "10";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "20";
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.YEAR_LENGTH);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} with DATE_NOT_IN_PAST_OR_TODAY error when start date is not in the past`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerGov["start_date-day"] =  inTheFuture.day.toString();
      beneficialOwnerGov["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerGov["start_date-year"] = inTheFuture.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the current page ${config.BENEFICIAL_OWNER_GOV_PAGE} without DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_DATE_VALIDATION };
      const today = DateTime.now();
      beneficialOwnerGov["start_date-day"] =  today.day.toString();
      beneficialOwnerGov["start_date-month"] = today.month.toString();
      beneficialOwnerGov["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
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
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${config.BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);

      await request(app)
        .post(config.BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${config.BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);

      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(config.BENEFICIAL_OWNER_GOV_URL + config.REMOVE + BO_GOV_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerGovKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_GOV_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
