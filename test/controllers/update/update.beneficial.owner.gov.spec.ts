jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/relevant.period');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { DateTime } from "luxon";
import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import request from "supertest";
import { NextFunction, Request, Response } from "express";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import app from "../../../src/app";
import {
  UPDATE_BENEFICIAL_OWNER_GOV_PAGE,
  UPDATE_BENEFICIAL_OWNER_GOV_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_LANDING_PAGE_URL,
  RELEVANT_PERIOD_QUERY_PARAM,
} from "../../../src/config";
import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  getApplicationData
} from '../../../src/utils/application.data';
import {
  ANY_MESSAGE_ERROR,
  BENEFICIAL_OWNER_GOV_PAGE_HEADING,
  ERROR_LIST,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  SHOW_INFORMATION_ON_PUBLIC_REGISTER,
  TRUSTS_NOC_HEADING,
  RELEVANT_PERIOD,
  RELEVANT_PERIOD_INFORMATION,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
} from "../../__mocks__/text.mock";
import { logger } from "../../../src/utils/logger";
import {
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY,
  BO_GOV_ID,
  BO_GOV_ID_URL,
  REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION,
  UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION,
  APPLICATION_DATA_UPDATE_BO_MOCK,
} from "../../__mocks__/session.mock";
import { AddressKeys } from '../../../src/model/data.types.model';
import { ServiceAddressKey, ServiceAddressKeys } from "../../../src/model/address.model";
import { ApplicationDataType } from '../../../src/model';
import {
  BENEFICIAL_OWNER_GOV_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  BENEFICIAL_OWNER_GOV_WITH_MAX_LENGTH_FIELDS_MOCK
} from "../../__mocks__/validation.mock";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from "../../../src/model/beneficial.owner.gov.model";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { checkRelevantPeriod } from "../../../src/utils/relevant.period";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const DUMMY_DATA_OBJECT = { dummy: "data" };
const mockCheckRelevantPeriod = checkRelevantPeriod as jest.Mock;

describe("UPDATE BENEFICIAL OWNER GOV controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });

      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
    });

    xtest("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with relevant period content when query param is passed`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });

      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_GOV_URL + RELEVANT_PERIOD_QUERY_PARAM);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_INFORMATION);
      expect(resp.text).toContain("1");
      expect(resp.text).toContain("January");
      expect(resp.text).toContain("2023");
    });
  });

  describe("GET BY ID tests", () => {
    xtest(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain("my company name");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("LegalForm");
      expect(resp.text).toContain("a11");
      expect(resp.text).toContain("name=\"is_on_sanctions_list\" type=\"radio\" value=\"1\" checked");
      expect(resp.text).toContain("name=\"is_still_bo\" type=\"radio\" value=\"1\" checked");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    xtest(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with relevant period content, when inserting a relevent period object`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce({ ...UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS, relevant_period: true });
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(RELEVANT_PERIOD);
      expect(resp.text).toContain(RELEVANT_PERIOD_INFORMATION);
      expect(resp.text).toContain("my company name");
      expect(resp.text).toContain("addressLine1");
      expect(resp.text).toContain("town");
      expect(resp.text).toContain("country");
      expect(resp.text).toContain("LegalForm");
      expect(resp.text).toContain("a11");
      expect(resp.text).toContain("name=\"is_on_sanctions_list\" type=\"radio\" value=\"1\" checked");
      expect(resp.text).toContain("name=\"is_still_bo\" type=\"radio\" value=\"1\" checked");
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("Should render the error page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const response = await request(app).get(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and do not redirect to ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_GOV_EMPTY );

      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_GOV_URL);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_GOV_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with INVALID CHARACTERS error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
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

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);
      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);
      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL);

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

    test.each([
      REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION,
      UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION
    ])(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only ENTER DATE error when date is completely empty`, async (mockObject) => {
      const beneficialOwnerGov = { ...mockObject };
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "01";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertEmptyMonthAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "01";
      beneficialOwnerGov["start_date-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertEmptyDayAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertEmptyDayAndMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "";
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyEmptyDayErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "06";
      beneficialOwnerGov["start_date-month"] = "";
      beneficialOwnerGov["start_date-year"] = "2020";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyEmptyMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "01";
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyEmptyYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when date is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "31";
      beneficialOwnerGov["start_date-month"] = "06";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when month is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "30";
      beneficialOwnerGov["start_date-month"] = "13";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when day is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "0";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when month is zero`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "30";
      beneficialOwnerGov["start_date-month"] = "0";
      beneficialOwnerGov["start_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when invalid characters are used`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "a";
      beneficialOwnerGov["start_date-month"] = "b";
      beneficialOwnerGov["start_date-year"] = "c";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only YEAR_LENGTH error when year length is not 4 digits`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "10";
      beneficialOwnerGov["start_date-month"] = "12";
      beneficialOwnerGov["start_date-year"] = "20";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyYearLengthError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when start date is not in the past`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerGov["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerGov["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerGov["start_date-year"] = inTheFuture.year.toString();
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyDayNotInPastErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerGov = { ...REQ_BODY_BENEFICIAL_OWNER_GOV_FOR_START_DATE_VALIDATION };
      const today = DateTime.now();
      beneficialOwnerGov["start_date-day"] = today.day.toString();
      beneficialOwnerGov["start_date-month"] = today.month.toString();
      beneficialOwnerGov["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when ceased date month and year are empty`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "01";
      beneficialOwnerGov["ceased_date-month"] = "";
      beneficialOwnerGov["ceased_date-year"] = "";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertEmptyMonthAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when ceased date day and year are empty`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "";
      beneficialOwnerGov["ceased_date-month"] = "01";
      beneficialOwnerGov["ceased_date-year"] = "";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertEmptyDayAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when ceased date day and month are empty`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "";
      beneficialOwnerGov["ceased_date-month"] = "";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertEmptyDayAndMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only DAY error when ceased date day is empty`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "";
      beneficialOwnerGov["ceased_date-month"] = "06";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyEmptyDayErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only MONTH error when ceased date month is empty`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "06";
      beneficialOwnerGov["ceased_date-month"] = "";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyEmptyMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only YEAR error when ceased date year is empty`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "01";
      beneficialOwnerGov["ceased_date-month"] = "06";
      beneficialOwnerGov["ceased_date-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyEmptyYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when date is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "31";
      beneficialOwnerGov["ceased_date-month"] = "06";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when month is outside valid numbers`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "30";
      beneficialOwnerGov["ceased_date-month"] = "13";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when day is zero`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "0";
      beneficialOwnerGov["ceased_date-month"] = "12";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when month is zero`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "30";
      beneficialOwnerGov["ceased_date-month"] = "0";
      beneficialOwnerGov["ceased_date-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only INVALID_DATE error when invalid characters are used`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "a";
      beneficialOwnerGov["ceased_date-month"] = "b";
      beneficialOwnerGov["ceased_date-year"] = "c";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only YEAR_LENGTH error when year length is not 4 digits`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["ceased_date-day"] = "10";
      beneficialOwnerGov["ceased_date-month"] = "12";
      beneficialOwnerGov["ceased_date-year"] = "20";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyYearLengthError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when ceased date is not in the past`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerGov["ceased_date-day"] = inTheFuture.day.toString();
      beneficialOwnerGov["ceased_date-month"] = inTheFuture.month.toString();
      beneficialOwnerGov["ceased_date-year"] = inTheFuture.year.toString();
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      assertOnlyDayNotInPastErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page with error when ceased date is before start date`, async () => {
      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_GOV_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerGov["start_date-day"] = "2";
      beneficialOwnerGov["start_date-month"] = "2";
      beneficialOwnerGov["start_date-year"] = "2023";
      beneficialOwnerGov["ceased_date-day"] = "1";
      beneficialOwnerGov["ceased_date-month"] = "1";
      beneficialOwnerGov["ceased_date-year"] = "2023";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL)
        .send(beneficialOwnerGov);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.CEASED_DATE_BEFORE_START_DATE);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_GOV_OBJECT_MOCK);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("replaces existing Government Beneficial Owner object on submit", async () => {
      const newGovData: BeneficialOwnerGov = { id: BO_GOV_ID, name: "new name" };
      mockPrepareData.mockReturnValueOnce(newGovData);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerGovKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_GOV_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_GOV_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerGovKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);

      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementation( () => BENEFICIAL_OWNER_GOV_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);

      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_GOV_URL + BO_GOV_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_GOV_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  const assertOnlyEmptyDayErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.DAY);
    expect(response.text).not.toContain(ErrorMessages.MONTH);
    expect(response.text).not.toContain(ErrorMessages.YEAR);
    expect(response.text).not.toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertOnlyEmptyMonthErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).not.toContain(ErrorMessages.DAY);
    expect(response.text).toContain(ErrorMessages.MONTH);
    expect(response.text).not.toContain(ErrorMessages.YEAR);
    expect(response.text).not.toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertOnlyEmptyYearErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).not.toContain(ErrorMessages.DAY);
    expect(response.text).not.toContain(ErrorMessages.MONTH);
    expect(response.text).toContain(ErrorMessages.YEAR);
    expect(response.text).not.toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertEmptyDayAndMonthErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.DAY_AND_MONTH);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertEmptyMonthAndYearErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.MONTH_AND_YEAR);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertEmptyDayAndYearErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.DAY_AND_YEAR);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertOnlyInvalidDateError = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).not.toContain(ErrorMessages.DAY);
    expect(response.text).not.toContain(ErrorMessages.MONTH);
    expect(response.text).not.toContain(ErrorMessages.YEAR);
    expect(response.text).toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertOnlyYearLengthError = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).toContain(ErrorMessages.YEAR_LENGTH);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).not.toContain(ErrorMessages.DAY);
    expect(response.text).not.toContain(ErrorMessages.MONTH);
    expect(response.text).not.toContain(ErrorMessages.YEAR);
    expect(response.text).not.toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertOnlyDayNotInPastErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_GOV_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).not.toContain(ErrorMessages.DAY);
    expect(response.text).not.toContain(ErrorMessages.MONTH);
    expect(response.text).not.toContain(ErrorMessages.YEAR);
    expect(response.text).not.toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };
});
