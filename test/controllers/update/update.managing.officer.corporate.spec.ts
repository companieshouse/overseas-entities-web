jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/save.and.continue');
jest.mock("../../../src/utils/feature.flag" );

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { ApplicationDataType, managingOfficerCorporateType } from "../../../src/model";
import { ServiceAddressKey, ServiceAddressKeys } from "../../../src/model/address.model";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey, PublicRegisterNameKey, RegistrationNumberKey,
} from "../../../src/model/data.types.model";
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_LANDING_PAGE_URL,
  UPDATE_MANAGING_OFFICER_CORPORATE_PAGE,
  UPDATE_MANAGING_OFFICER_CORPORATE_URL,
  REMOVE
} from "../../../src/config";
import {
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  MANAGING_OFFICER_CORPORATE_PAGE_TITLE,
  MESSAGE_ERROR,
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  SHOW_OTHER_INFORMATION_IN_SECTION_ON_PUBLIC_REGISTER,
  NOT_SHOW_NAME_OR_EMAIL_ON_PUBLIC_REGISTER,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
} from "../../__mocks__/text.mock";
import {
  UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE,
  REQ_BODY_MANAGING_OFFICER_CORPORATE_OBJECT_EMPTY,
  RR_CARRIAGE_RETURN,
  EMAIL_ADDRESS,
  MO_CORP_ID_URL,
  MO_CORP_ID,
  APPLICATION_DATA_CH_REF_UPDATE_MOCK,
  MO_IND_ID_URL,
  APPLICATION_DATA_MOCK,
  UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_INACTIVE
} from "../../__mocks__/session.mock";
import {
  MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK,
  MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  MANAGING_OFFICER_CORPORATE_WITH_MAX_LENGTH_FIELDS_MOCK
} from "../../__mocks__/validation.mock";
import {
  getApplicationData,
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData
} from "../../../src/utils/application.data";
import { logger } from "../../../src/utils/logger";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey } from '../../../src/model/managing.officer.corporate.model';

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenterMiddleware = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const DUMMY_DATA_OBJECT = { dummy: "data" };

describe("UPDATE MANAGING OFFICER CORPORATE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(SHOW_OTHER_INFORMATION_IN_SECTION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_NAME_OR_EMAIL_ON_PUBLIC_REGISTER);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`sets session data and renders the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for active MO`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      const managingOfficerCorporate = mockSetApplicationData.mock.calls[0][1];

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(managingOfficerCorporate).toEqual(UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
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

    test(`sets session data and renders the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for inactive MO`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_INACTIVE);

      const managingOfficerCorporate = mockSetApplicationData.mock.calls[0][1];

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(managingOfficerCorporate).toEqual(UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      expect(managingOfficerCorporate.name).toEqual("Joe Bloggs Ltd");
      expect(managingOfficerCorporate.legal_form).toEqual("legalForm");
      expect(managingOfficerCorporate.law_governed).toEqual("LegAuth");
      expect(managingOfficerCorporate.registration_number).toEqual("123456789");
      expect(managingOfficerCorporate.role_and_responsibilities).toEqual("role and responsibilities text");
      expect(managingOfficerCorporate.contact_full_name).toEqual("Joe Bloggs");
      expect(managingOfficerCorporate.contact_email).toEqual("jbloggs@bloggs.co.ru");
      expect(managingOfficerCorporate.start_date).toEqual(DUMMY_DATA_OBJECT);
      expect(managingOfficerCorporate.resigned_on).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerCorporateType.ManagingOfficerCorporateKey);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and redirect to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => { return { [IsOnRegisterInCountryFormedInKey]: 0, [HasSamePrincipalAddressKey]: 0 }; } );

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("Test email is valid with long email address", async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const managingOfficerCorporate = {
        ...REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE,
        contact_email: "vsocarroll@QQQQQQQT123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficerCorporate);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with long email name and address", async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const managingOfficerCorporate = {
        ...REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE,
        contact_email: "socarrollA123456789B132456798C123456798D123456789@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficerCorporate);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("Test email is valid with very long email name and address", async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const managingOfficerCorporate = {
        ...REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE,
        contact_email: "socarrollA123456789B132456798C123456798D123456789E123456789F123XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(managingOfficerCorporate);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} with error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
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
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(UPDATE_MANAGING_OFFICER_CORPORATE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} with public register error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send({ is_on_register_in_country_formed_in: "1", public_register_name: "       " });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} with MAX error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
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
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
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
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} with INVALID CHARACTERS error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
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
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.CONTACT_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
    });

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} with INVALID_CHARACTERS service address error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
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

    test(`renders the current page ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} with no INVALID CHARACTERS error messages when carriage return used in text box`, async () => {
      const carriageReturnMock = { ...MANAGING_OFFICER_CORPORATE_WITH_INVALID_CHARS_MOCK };
      carriageReturnMock["role_and_responsibilities"] = RR_CARRIAGE_RETURN;
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(carriageReturnMock);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.ROLES_AND_RESPONSIBILITIES_INVALID_CHARACTERS);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`Public register data from the ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page is present when is on register set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("Reg");
      expect(data[RegistrationNumberKey]).toEqual("123456");
    });

    test(`Public register data from the ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page is empty when is on register set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
    });

    test(`renders the next page ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} and no errors are reported if email has leading and trailing spaces`, async () => {
      mockPrepareData.mockReturnValueOnce(UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);

      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL)
        .send(UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["contact_email"]).toEqual(EMAIL_ADDRESS);
    });
  });

  describe("GET BY ID tests", () => {
    test(`renders ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_CH_REF_UPDATE_MOCK });

      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_CORPORATE_PAGE_TITLE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain("Joe Bloggs");
    });

    test(`catch error when rendering the ${UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      const newMoData: ManagingOfficerCorporate = { id: MO_CORP_ID, name: "new name", role_and_responsibilities: "role and responsibilities text", contact_email: "test@test.com", contact_full_name: "full name" };
      mockPrepareData.mockReturnValueOnce(newMoData);
      const resp = await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerCorporateKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_CORP_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(MO_CORP_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(ManagingOfficerCorporateKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_CORPORATE_URL} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${UPDATE_MANAGING_OFFICER_CORPORATE_URL} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${UPDATE_MANAGING_OFFICER_CORPORATE_URL} is present when is on register set to yes`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_YES);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("Reg");
      expect(data[RegistrationNumberKey]).toEqual("123456");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Public register data from the ${UPDATE_MANAGING_OFFICER_CORPORATE_URL} is empty when is on register set to no`, async () => {
      mockPrepareData.mockImplementation( () => MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_PUBLIC_REGISTER_DATA_NO);
      await request(app)
        .post(UPDATE_MANAGING_OFFICER_CORPORATE_URL + MO_CORP_ID_URL)
        .send(REQ_BODY_UPDATE_MANAGING_OFFICER_CORPORATE_MOCK_ACTIVE);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual("");
      expect(data[RegistrationNumberKey]).toEqual("");
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK);
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(UPDATE_MANAGING_OFFICER_CORPORATE_URL + REMOVE + MO_CORP_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerCorporateKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_CORP_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

});
