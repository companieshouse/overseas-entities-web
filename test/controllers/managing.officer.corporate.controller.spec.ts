jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/logger");
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";

import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey, PublicRegisterNameKey, RegistrationNumberKey,
} from "../../src/model/data.types.model";
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import {
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  MO_CORP_ID,
  MO_CORP_ID_URL,
  REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
  REQ_BODY_MANAGING_OFFICER_CORPORATE_OBJECT_EMPTY,
  RR_CARRIAGE_RETURN
} from "../__mocks__/session.mock";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  BENEFICIAL_OWNER_TYPE_URL,
  LANDING_PAGE_URL,
  MANAGING_OFFICER_CORPORATE_PAGE,
  MANAGING_OFFICER_CORPORATE_URL,
  REMOVE
} from "../../src/config";
import {
  JURISDICTION_FIELD_LABEL,
  MANAGING_OFFICER_CORPORATE_PAGE_TITLE,
  MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  PUBLIC_REGISTER_HINT_TEXT,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
  SERVICE_UNAVAILABLE
} from "../__mocks__/text.mock";
import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData
} from "../../src/utils/application.data";
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { ApplicationDataType, managingOfficerCorporateType } from "../../src/model";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from '../../src/model/managing.officer.corporate.model';
import { ErrorMessages } from "../../src/validation/error.messages";
import {
  MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK,
  MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  MANAGING_OFFICER_CORPORATE_WITH_MAX_LENGTH_FIELDS_MOCK
} from "../__mocks__/validation.mock";
import { logger } from "../../src/utils/logger";
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import { EMAIL_ADDRESS } from "../__mocks__/session.mock";

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };

describe("MANAGING_OFFICER CORPORATE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {

    test(`renders the ${MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test(`renders the ${MANAGING_OFFICER_CORPORATE_PAGE} page without public register jurisdiction field`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(JURISDICTION_FIELD_LABEL);
      expect(resp.text).toContain(PUBLIC_REGISTER_HINT_TEXT);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
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
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
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
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () =>  { return { [IsOnRegisterInCountryFormedInKey]: 0, [HasSamePrincipalAddressKey]: 0 }; } );

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("Test email is valid with long email address", async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const managingOfficerCorporate = {
        ...REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
        contact_email: "vsocarroll@QQQQQQQT123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };


      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficerCorporate);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test("Test email is valid with long email name and address", async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const managingOfficerCorporate = {
        ...REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
        contact_email: "socarrollA123456789B132456798C123456798D123456789@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficerCorporate);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test("Test email is valid with very long email name and address", async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const managingOfficerCorporate = {
        ...REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS,
        contact_email: "socarrollA123456789B132456798C123456798D123456789E123456789F123XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficerCorporate);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
      expect(resp.text).toContain(ErrorMessages.ROLE_AND_RESPONSIBILITIES_CORPORATE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(MANAGING_OFFICER_CORPORATE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CONTACT_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the current page ${MANAGING_OFFICER_CORPORATE_URL} with no INVALID CHARACTERS error messages when carriage return used in text box`, async () => {
      const carriageReturnMock = { ...MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK };
      carriageReturnMock["role_and_responsibilities"] = RR_CARRIAGE_RETURN;
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(carriageReturnMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is present when is on register set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("Reg");
      expect(data[RegistrationNumberKey]).toEqual("123456");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when is on register set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL)
        .send(MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["contact_email"]).toEqual(EMAIL_ADDRESS);
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
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is present when is on register set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("Reg");
      expect(data[RegistrationNumberKey]).toEqual("123456");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${MANAGING_OFFICER_CORPORATE_URL} is empty when is on register set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      await request(app)
        .post(MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_MANAGING_OFFICER_CORPORATE_MOCK_WITH_ADDRESS);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerCorporateKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_CORP_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });
});
