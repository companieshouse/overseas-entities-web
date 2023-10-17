jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import {
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE
} from "../../../src/config";
import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  getApplicationData
} from '../../../src/utils/application.data';
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import {
  ANY_MESSAGE_ERROR,
  BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING,
  ERROR_LIST,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  SECOND_NATIONALITY,
  SECOND_NATIONALITY_HINT,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  NOT_SHOW_BENEFICIAL_OWNER_INFORMATION_ON_PUBLIC_REGISTER,
  ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT,
  TRUSTS_NOC_HEADING,
} from '../../__mocks__/text.mock';
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS,
  BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH,
  BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE,
  BO_IND_ID,
  BO_IND_ID_URL,
  REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
} from '../../__mocks__/session.mock';
import { BeneficialOwnerIndividualKey } from '../../../src/model/beneficial.owner.individual.model';
import { AddressKeys } from '../../../src/model/data.types.model';
import {
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../../__mocks__/validation.mock';
import { saveAndContinueButtonText } from '../../__mocks__/save.and.continue.mock';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { ServiceAddressKey, ServiceAddressKeys } from "../../../src/model/address.model";
import { ApplicationDataType } from '../../../src/model';
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import * as config from "../../../src/config";
import { DateTime } from "luxon";
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;
const mockMapFieldsToDataObject = mapFieldsToDataObject as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

const DUMMY_DATA_OBJECT = { dummy: "data" };

describe("UPDATE BENEFICIAL OWNER INDIVIDUAL controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });

      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(ALL_THE_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_BENEFICIAL_OWNER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).not.toContain(TRUSTS_NOC_HEADING);
    });
  });

  describe("GET BY ID tests", () => {
    test(`renders ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });

      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).toContain("Ivan");
      expect(resp.text).toContain("Drago");
      expect(resp.text).toContain("Russian");
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain("name=\"is_still_bo\" type=\"radio\" value=\"1\" checked");
    });

    test(`catch error when rendering the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST only radio buttons choices and do not redirect to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => { return BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS; } );
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirect to the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page after a successful post from ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with service address data`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO );
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send({
          ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO,
          is_still_bo: "1"
        });

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_PAGE_REDIRECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST empty object and do not redirect to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY );

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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
      expect(resp.header.location).not.toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`adds data to the session and redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerIndividualKey);
      expect(resp.status).toEqual(302);

      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with INVALID_CHARACTERS error message`, async () => {
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with INVALID_CHARACTERS service address error message`, async () => {
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER DATE error when start date is completely empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date month and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "01";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertEmptyMonthAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "01";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertEmptyDayAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day and month are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertEmptyDayAndMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DAY error when start date day is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyDayErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only MONTH error when start date month is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR error when start date year is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "22";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "32";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date month is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "13";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing DAY error when start date day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "00";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyDayErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing MONTH error when start date month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "00";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing YEAR error when start date year is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "00";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyYearErrors(resp);
    });

    test(`leading zeros are stripped from start date`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      beneficialOwnerGov["start_date-day"] = "0030";
      beneficialOwnerGov["start_date-month"] = "0011";
      beneficialOwnerGov["start_date-year"] = "002019";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerGov);

      expect(resp.status).toEqual(302);
      const reqBody = mockPrepareData.mock.calls[0][0];
      expect(reqBody["start_date-day"]).toEqual("30");
      expect(reqBody["start_date-month"]).toEqual("11");
      expect(reqBody["start_date-year"]).toEqual("2019");
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when start_date is in the future`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["start_date-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyDayNotInPastErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page without date errors including DATE_NOT_IN_PAST_OR_TODAY error when start date is today`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const today = DateTime.now();
      beneficialOwnerIndividual["start_date-day"] = today.day.toString();
      beneficialOwnerIndividual["start_date-month"] = today.month.toString();
      beneficialOwnerIndividual["start_date-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      // expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DAY);
      expect(resp.text).not.toContain(ErrorMessages.MONTH);
      expect(resp.text).not.toContain(ErrorMessages.YEAR);
      expect(resp.text).not.toContain(ErrorMessages.INVALID_DATE);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when start date year is not 4 digits`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "10";
      beneficialOwnerIndividual["start_date-year"] = "20";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyYearLengthError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when start date year is not 4 digits with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "10";
      beneficialOwnerIndividual["start_date-year"] = "0020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyYearLengthError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER DATE error when ceased date is completely empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "";
      beneficialOwnerIndividual["ceased_date-month"] = "";
      beneficialOwnerIndividual["ceased_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER DATE error when ceased date is only zeroes`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "00";
      beneficialOwnerIndividual["ceased_date-month"] = "00";
      beneficialOwnerIndividual["ceased_date-year"] = "00";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date month and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "01";
      beneficialOwnerIndividual["ceased_date-month"] = "";
      beneficialOwnerIndividual["ceased_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertEmptyMonthAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date day and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "";
      beneficialOwnerIndividual["ceased_date-month"] = "01";
      beneficialOwnerIndividual["ceased_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertEmptyDayAndYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date day and month are empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "";
      beneficialOwnerIndividual["ceased_date-month"] = "";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertEmptyDayAndMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DAY error when ceased date day is empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "";
      beneficialOwnerIndividual["ceased_date-month"] = "11";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyDayErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only MONTH error when ceased date month is empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "30";
      beneficialOwnerIndividual["ceased_date-month"] = "";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR error when ceased date year is empty`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "22";
      beneficialOwnerIndividual["ceased_date-month"] = "11";
      beneficialOwnerIndividual["ceased_date-year"] = "";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyYearErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date day is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "32";
      beneficialOwnerIndividual["ceased_date-month"] = "11";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date day is outside valid numbers with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "0032";
      beneficialOwnerIndividual["ceased_date-month"] = "11";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date month is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "30";
      beneficialOwnerIndividual["ceased_date-month"] = "13";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when ceased date month is outside valid numbers with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "30";
      beneficialOwnerIndividual["ceased_date-month"] = "0013";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyInvalidDateError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing DAY error when ceased date day is zero`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "00";
      beneficialOwnerIndividual["ceased_date-month"] = "11";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyDayErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing MONTH error when ceased date month is zero`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "30";
      beneficialOwnerIndividual["ceased_date-month"] = "00";
      beneficialOwnerIndividual["ceased_date-year"] = "2020";
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyEmptyMonthErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when ceased_date is in the future`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["ceased_date-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["ceased_date-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["ceased_date-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyDayNotInPastErrors(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when ceased date year is not 4 digits`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "30";
      beneficialOwnerIndividual["ceased_date-month"] = "10";
      beneficialOwnerIndividual["ceased_date-year"] = "20";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyYearLengthError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when ceased date year is not 4 digits with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["ceased_date-day"] = "30";
      beneficialOwnerIndividual["ceased_date-month"] = "10";
      beneficialOwnerIndividual["ceased_date-year"] = "0020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      assertOnlyYearLengthError(resp);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with error when ceased date is before start date`, async () => {
      const beneficialOwnerIndividual = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_MOCK_FOR_CEASE_VALIDATION };
      beneficialOwnerIndividual["start_date-day"] = "2";
      beneficialOwnerIndividual["start_date-month"] = "2";
      beneficialOwnerIndividual["start_date-year"] = "2023";
      beneficialOwnerIndividual["ceased_date-day"] = "1";
      beneficialOwnerIndividual["ceased_date-month"] = "1";
      beneficialOwnerIndividual["ceased_date-year"] = "2023";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.CEASED_DATE_BEFORE_START_DATE);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER_DATE_OF_BIRTH error when date of birth is completely empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "01";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day and year are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "01";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day and month are empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "2020";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.ENTER_DATE_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
      expect(resp.text).not.toContain(ErrorMessages.DATE_OF_BIRTH_NOT_IN_PAST);
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DAY_OF_BIRTH error error when date of birth day is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "01";
      beneficialOwnerIndividual["date_of_birth-year"] = "2023";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only MONTH_OF_BIRTH error error when date of birth month is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "01";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "2023";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_OF_BIRTH error error when date of birth year is empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "11";
      beneficialOwnerIndividual["date_of_birth-month"] = "03";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "32";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day is outside valid numbers with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "0032";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month is outside valid numbers`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "13";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month is outside valid numbers with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "0013";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing DAY error when date of birth day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "00";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing MONTH error when date of birth month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "00";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only missing YEAR error when date of birth year is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "10";
      beneficialOwnerIndividual["date_of_birth-year"] = "0000";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST error when date of birth is in the future`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["date_of_birth-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["date_of_birth-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["date_of_birth-year"] = inTheFuture.year.toString();

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST error when date of birth is today`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const today = DateTime.now();
      beneficialOwnerIndividual["date_of_birth-day"] = today.day.toString();
      beneficialOwnerIndividual["date_of_birth-month"] = today.month.toString();
      beneficialOwnerIndividual["date_of_birth-year"] = today.year.toString();
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when date of birth year is not 4 digits`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "11";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "70";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only YEAR_LENGTH error when date of birth year is not 4 digits with leading zeroes`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "11";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "0070";
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
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

    test(`leading zeros are stripped from date of birth`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      beneficialOwnerGov["date_of_birth-day"] = "0030";
      beneficialOwnerGov["date_of_birth-month"] = "0011";
      beneficialOwnerGov["date_of_birth-year"] = "002019";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerGov);

      expect(resp.status).toEqual(302);
      const reqBody = mockPrepareData.mock.calls[0][0];
      expect(reqBody["date_of_birth-day"]).toEqual("30");
      expect(reqBody["date_of_birth-month"]).toEqual("11");
      expect(reqBody["date_of_birth-year"]).toEqual("2019");
    });

    test(`leading zeros are stripped from ceased date`, async () => {
      mockPrepareData.mockImplementationOnce( () => UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const beneficialOwnerGov = { ...UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      beneficialOwnerGov["ceased_date-day"] = "0030";
      beneficialOwnerGov["ceased_date-month"] = "0011";
      beneficialOwnerGov["ceased_date-year"] = "002019";

      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerGov);

      expect(resp.status).toEqual(302);
      const reqBody = mockPrepareData.mock.calls[0][0];
      expect(reqBody["ceased_date-day"]).toEqual("30");
      expect(reqBody["ceased_date-month"]).toEqual("11");
      expect(reqBody["ceased_date-year"]).toEqual("2019");
    });

    test(`renders the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with second nationality error when same as nationality`, async () => {
      const beneficialOwnerIndividual = {
        ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockReturnValueOnce(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when updating data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`replaces existing object on submit`, async () => {
      mockPrepareData.mockReturnValueOnce({ id: BO_IND_ID, name: "new name" });
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerIndividualKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_IND_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerIndividualKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} is present when same address is set to no`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);
      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mapFieldsToDataObject).not.toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual({});
    });

    test(`renders the page ${UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} + ${BO_IND_ID_URL} with second nationality error when same as nationality`, async () => {
      const beneficialOwnerIndividual = {
        ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
        nationality: "British",
        second_nationality: "British"
      };
      const resp = await request(app).post(UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });
  });

  const assertOnlyEmptyDayErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
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
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
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
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
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
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.DAY_AND_MONTH);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertEmptyMonthAndYearErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.MONTH_AND_YEAR);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertEmptyDayAndYearErrors = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).toContain(ErrorMessages.DAY_AND_YEAR);
    expect(response.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };

  const assertOnlyInvalidDateError = (response) => {
    expect(response.status).toEqual(200);
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
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
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
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
    expect(response.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
    expect(response.text).not.toContain(ErrorMessages.ENTER_DATE);
    expect(response.text).not.toContain(ErrorMessages.DAY);
    expect(response.text).not.toContain(ErrorMessages.MONTH);
    expect(response.text).not.toContain(ErrorMessages.YEAR);
    expect(response.text).not.toContain(ErrorMessages.INVALID_DATE);
    expect(response.text).toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY);
    expect(mockSaveAndContinue).not.toHaveBeenCalled();
  };
});
