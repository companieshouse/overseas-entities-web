jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');

import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import { Settings as luxonSettings } from "luxon";
import app from "../../src/app";

import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey, PublicRegisterNameKey, RegistrationNumberKey,
} from "../../src/model/data.types.model";

import {
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  MO_CORP_ID,
  MO_CORP_ID_URL, REQ_BODY_MANAGING_OFFICER_CORPORATE_FOR_DATE_VALIDATION,
  REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
  REQ_BODY_MANAGING_OFFICER_CORPORATE_OBJECT_EMPTY
} from "../__mocks__/session.mock";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  BENEFICIAL_OWNER_TYPE_URL,
  MANAGING_OFFICER_CORPORATE_PAGE,
  MANAGING_OFFICER_CORPORATE_URL,
  REMOVE } from "../../src/config";
import { MANAGING_OFFICER_CORPORATE_PAGE_TITLE, MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../__mocks__/text.mock";
import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData
} from "../../src/utils/application.data";
import { ApplicationDataType, managingOfficerCorporateType } from "../../src/model";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from '../../src/model/managing.officer.corporate.model';
import { ErrorMessages } from "../../src/validation/error.messages";
import {
  MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK,
  MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  MANAGING_OFFICER_CORPORATE_WITH_MAX_LENGTH_FIELDS_MOCK
} from "../__mocks__/validation.mock";
import { logger } from "../../src/utils/logger";
import { DateTime, Duration } from "luxon";
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;

const today = "2022-01-02";
const DUMMY_DATA_OBJECT = { dummy: "data" };

describe("MANAGING_OFFICER CORPORATE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    luxonSettings.now = () => new Date(today).valueOf();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {

    test(`renders the ${MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
    });
  });

  describe("GET BY ID tests", () => {

    test("renders the managing officer corporate page", async () => {
      mockGetFromApplicationData.mockReturnValueOnce(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain("Joe Bloggs Ltd");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("legalForm");
      expect(resp.text).toContain("LegAuth");
      expect(resp.text).toContain("123456789");
      expect(resp.text).toContain("role and responsibilities text");
    });

    test("Should render the error page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      const managingOfficerCorporate = mockSetApplicationData.mock.calls[0][1];

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(managingOfficerCorporate).toEqual(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      expect(managingOfficerCorporate.name).toEqual("Joe Bloggs Ltd");
      expect(managingOfficerCorporate.legal_form).toEqual("legalForm");
      expect(managingOfficerCorporate.law_governed).toEqual("LegAuth");
      expect(managingOfficerCorporate.registration_number).toEqual("123456789");
      expect(managingOfficerCorporate.role_and_responsibilities).toEqual("role and responsibilities text");
      expect(managingOfficerCorporate.contact_full_name).toEqual("Joe Bloggs");
      expect(managingOfficerCorporate.contact_email).toEqual("jbloggs@bloggs.co.ru");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerCorporateType.ManagingOfficerCorporateKey);
    });

    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () =>  { return { [IsOnRegisterInCountryFormedInKey]: 0, [HasSamePrincipalAddressKey]: 0 }; } );

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_OBJECT_EMPTY);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MANAGING_OFFICER_CORPORATE_NAME);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_MANAGING_OFFICER_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_MANAGING_OFFICER_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(resp.text).toContain(ErrorMessages.DAY);
      expect(resp.text).toContain(ErrorMessages.MONTH);
      expect(resp.text).toContain(ErrorMessages.YEAR);
      expect(resp.text).toContain(ErrorMessages.ROLE_AND_RESPONSIBILITIES_CORPORATE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with public register error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send({ is_on_register_in_country_formed_in: "1", public_register_name: "       " });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(MANAGING_OFFICER_CORPORATE_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
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
      expect(resp.text).toContain(ErrorMessages.MAX_ROLE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_FULL_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.MANAGING_OFFICER_CORPORATE_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).not.toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).not.toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).not.toContain(ErrorMessages.COUNTRY);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_MANAGING_OFFICER_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).not.toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).not.toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_MANAGING_OFFICER_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID CHARACTERS error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CONTACT_NAME_INVALID_CHARACTERS);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID_CHARACTERS service address error messages`, async () => {
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_1_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE_2_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.COUNTY_STATE_PROVINCE_REGION_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.POSTCODE_ZIPCODE_INVALID_CHARACTERS);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with FUTURE_DATE error messages`, async () => {
      const futureDate = DateTime.now().plus(Duration.fromObject({ days: 1 }));
      const managingOfficer = MANAGING_OFFICER_CORPORATE_OBJECT_MOCK;
      managingOfficer["start_date-day"] =  futureDate.day.toString();
      managingOfficer["start_date-month"] = futureDate.month.toString();
      managingOfficer["start_date-year"] = futureDate.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MO_START_DATE_NOT_IN_PAST);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} without FUTURE_DATE error messages for valid date`, async () => {
      const pastDate = DateTime.now().minus(Duration.fromObject({ days: 1 }));
      const managingOfficer = MANAGING_OFFICER_CORPORATE_OBJECT_MOCK;
      managingOfficer["start_date-day"] =  pastDate.day.toString();
      managingOfficer["start_date-month"] = pastDate.month.toString();
      managingOfficer["start_date-year"] = pastDate.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.MO_START_DATE_NOT_IN_PAST);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} without FUTURE_DATE service address error messages for todays date`, async () => {
      const currentDate = DateTime.now();
      const managingOfficer = MANAGING_OFFICER_CORPORATE_OBJECT_MOCK;
      managingOfficer["start_date-day"] =  currentDate.day.toString();
      managingOfficer["start_date-month"] = currentDate.month.toString();
      managingOfficer["start_date-year"] = currentDate.year.toString();
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MO_START_DATE_NOT_IN_PAST);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is present when is on register set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("Reg");
      expect(data[RegistrationNumberKey]).toEqual("123456");
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when is on register set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID_START_DATE error when date is outside valid numbers`, async () => {
      const managingOfficer = REQ_BODY_MANAGING_OFFICER_CORPORATE_FOR_DATE_VALIDATION;
      managingOfficer["start_date-day"] =  "31";
      managingOfficer["start_date-month"] = "06";
      managingOfficer["start_date-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_START_DATE);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID_START_DATE error when month is outside valid numbers`, async () => {
      const managingOfficer = REQ_BODY_MANAGING_OFFICER_CORPORATE_FOR_DATE_VALIDATION;
      managingOfficer["start_date-day"] =  "30";
      managingOfficer["start_date-month"] = "13";
      managingOfficer["start_date-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_START_DATE);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID_START_DATE error when day is zero`, async () => {
      const managingOfficer = REQ_BODY_MANAGING_OFFICER_CORPORATE_FOR_DATE_VALIDATION;
      managingOfficer["start_date-day"] =  "0";
      managingOfficer["start_date-month"] = "13";
      managingOfficer["start_date-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_START_DATE);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID_START_DATE error when month is zero`, async () => {
      const managingOfficer = REQ_BODY_MANAGING_OFFICER_CORPORATE_FOR_DATE_VALIDATION;
      managingOfficer["start_date-day"] =  "30";
      managingOfficer["start_date-month"] = "0";
      managingOfficer["start_date-year"] = "2020";
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_START_DATE);
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with INVALID_START_DATE error when invalid characters are used`, async () => {
      const managingOfficer = REQ_BODY_MANAGING_OFFICER_CORPORATE_FOR_DATE_VALIDATION;
      managingOfficer["start_date-day"] =  "a";
      managingOfficer["start_date-month"] = "b";
      managingOfficer["start_date-year"] = "c";
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficer);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.INVALID_START_DATE);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`replaces existing object on submit`, async () => {
      const newMoData: ManagingOfficerCorporate = { id: MO_CORP_ID, name: "new name", role_and_responsibilities: "role and responsibilities text", contact_email: "test@test.com", contact_full_name: "full name" };
      mockPrepareData.mockReturnValueOnce(newMoData);
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerCorporateKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_CORP_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(MO_CORP_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(ManagingOfficerCorporateKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is present when is on register set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("Reg");
      expect(data[RegistrationNumberKey]).toEqual("123456");
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when is on register set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerCorporateKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_CORP_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
