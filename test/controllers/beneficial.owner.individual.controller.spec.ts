import { constants } from "http2";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";

import {
  BENEFICIAL_OWNER_INDIVIDUAL_PAGE,
  BENEFICIAL_OWNER_INDIVIDUAL_URL,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL,
  BENEFICIAL_OWNER_TYPE_PAGE,
  BENEFICIAL_OWNER_TYPE_URL,
  BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  REMOVE,
} from "../../src/config";

import {
  getFromApplicationData,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  getApplicationData
} from '../../src/utils/application.data';

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
  BACK_BUTTON_CLASS,
  TRUST_CONTROL_NOC_HEADING,
  OWNER_OF_LAND_PERSON_NOC_HEADING,
  OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING,
  FIRM_NOC_HEADING_NEW,
  BO_NOC_HEADING,
  FIRM_NOC_HEADING,
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

import {
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_INVALID_CHARS_SERVICE_ADDRESS_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../__mocks__/validation.mock';

import { BeneficialOwnerIndividual, BeneficialOwnerIndividualKey } from '../../src/model/beneficial.owner.individual.model';
import { AddressKeys, EntityNumberKey, NatureOfControlJurisdiction, NatureOfControlType, NonLegalFirmControlNoc, OwnerOfLandOtherEntityJurisdictionsNoc, OwnerOfLandPersonJurisdictionsNoc, TrustControlNoc } from '../../src/model/data.types.model';
import { saveAndContinue } from "../../src/utils/save.and.continue";
import { ErrorMessages } from '../../src/validation/error.messages';
import { ServiceAddressKey, ServiceAddressKeys } from "../../src/model/address.model";
import { ApplicationDataType } from '../../src/model';
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import * as config from "../../src/config";
import { DateTime } from "luxon";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { getUrlWithParamsToPath } from "../../src/utils/url";

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

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const NEXT_PAGE_URL = "/NEXT_PAGE";

const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

describe("BENEFICIAL OWNER INDIVIDUAL controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
    mockMapFieldsToDataObject.mockReset();
    mockMapFieldsToDataObject.mockReturnValue(DUMMY_DATA_OBJECT);
    mockIsActiveFeature.mockReset();
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
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING_NEW);
      expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page natures of control correctly when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is active`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING_NEW);
      expect(resp.text).toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with correct back link url when Redis removal feature flag is off`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce({ ...appData });
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(0);
    });
  });

  describe("GET with url params tests", () => {
    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL);

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
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING_NEW);
      expect(resp.text).not.toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).not.toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page natures of control correctly when FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is active`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];

      mockGetApplicationData.mockReturnValueOnce({ ...appData });

      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(BO_NOC_HEADING);
      expect(resp.text).toContain(TRUSTS_NOC_HEADING);
      expect(resp.text).not.toContain(FIRM_NOC_HEADING);
      expect(resp.text).toContain(FIRM_NOC_HEADING_NEW);
      expect(resp.text).toContain(TRUST_CONTROL_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_PERSON_NOC_HEADING);
      expect(resp.text).toContain(OWNER_OF_LAND_OTHER_ENITY_NOC_HEADING);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with correct back link url when feature flag is on`, async () => {
      const appData = APPLICATION_DATA_MOCK;
      delete appData[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce({ ...appData });
      mockGetUrlWithParamsToPath.mockReturnValueOnce(`${BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL}`);
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page when the REDIS_removal flag is ON`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain("Ivan");
      expect(resp.text).toContain("Drago");
      expect(resp.text).toContain("Russian");
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(2);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(3);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page when the REDIS_removal flag is OFF`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(false); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain("Ivan");
      expect(resp.text).toContain("Drago");
      expect(resp.text).toContain("Russian");
      expect(resp.text).toContain(SECOND_NATIONALITY);
      expect(resp.text).toContain(SECOND_NATIONALITY_HINT);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(0);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(3);
    });

    test("catch error when rendering the page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("GET BY ID with url params tests", () => {
    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      const applicationDataMock = { ...APPLICATION_DATA_MOCK };
      delete applicationDataMock[EntityNumberKey];
      mockGetApplicationData.mockReturnValueOnce(applicationDataMock);

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + BO_IND_ID_URL);

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
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + BO_IND_ID_URL);

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

    test(`redirects to ${BENEFICIAL_OWNER_TYPE_PAGE} page when date of birth contains spaces`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const submissionMock = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      submissionMock["date_of_birth-day"] = " 1 ";
      submissionMock["date_of_birth-month"] = " 1 ";
      submissionMock["date_of_birth-year"] = " 2000 ";

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send(submissionMock);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);

      // Additionally check that date fields are trimmed before they're saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["date_of_birth-day"]).toEqual("1");
      expect(data["date_of_birth-month"]).toEqual("1");
      expect(data["date_of_birth-year"]).toEqual("2000");
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
      mockPrepareData.mockReturnValueOnce( { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO } );
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

    test(`correctly maps natures of controle when feature flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
      mockPrepareData.mockImplementationOnce( () => {
        return {
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
          non_legal_firm_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
          trust_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
          owner_of_land_person_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.ENGLAND_AND_WALES],
          owner_of_land_other_entity_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.NORTHERN_IRELAND]
        };
      });

      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
        .send({
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
        });

      const appData: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];

      expect(appData[TrustControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(appData[NonLegalFirmControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(appData[OwnerOfLandPersonJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.ENGLAND_AND_WALES]);
      expect(appData[OwnerOfLandOtherEntityJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.NORTHERN_IRELAND]);
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
      mockPrepareData.mockReturnValueOnce( { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO } );
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "0";
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "0";
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "0";
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "0";
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

    describe("Nature of controls tests", () => {

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null],
        ["Trustee Noc", null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null],
        ["Non legal firm Noc", null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]]
      ])(`redirect to the ${BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF - %s`, async (_desc, boNoc, trusteeNoc, nonLegalNoc) => {
        mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

        const body = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: boNoc,
          trustees_nature_of_control_types: trusteeNoc,
          non_legal_firm_members_nature_of_control_types: nonLegalNoc,
        };

        const resp = await request(app)
          .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      });

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null, null, null],
        ["Trustee Noc", null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null, null],
        ["Trust control Noc", null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null],
        ["Non legal firm control Noc", null, null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null],
        ["Owner of land person Noc", null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES], null],
        ["Owner of land other entitiy Noc", null, null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES]],
      ])(`redirect to the ${BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON - %s`, async (_desc, boNoc, trusteeNoc, trustControlNoc, nonLegalFirmControlNoc, landPersonNoc, landOtherEntityNoc) => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

        const body = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: boNoc,
          trustees_nature_of_control_types: trusteeNoc,
          trust_control_nature_of_control_types: trustControlNoc,
          non_legal_firm_control_nature_of_control_types: nonLegalFirmControlNoc,
          owner_of_land_person_nature_of_control_jurisdictions: landPersonNoc,
          owner_of_land_other_entity_nature_of_control_jurisdictions: landOtherEntityNoc
        };

        const resp = await request(app)
          .post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      });

      test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with nature of control error when no nature of control is provided and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is OFF`, async () => {
        const beneficialOwnerIndividual = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: null,
          trustees_nature_of_control_types: null,
          non_legal_firm_members_nature_of_control_types: null,
        };
        const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
          .send(beneficialOwnerIndividual);
        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
        expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      });

      test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with nature of control error when no nature of control is provided and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        const beneficialOwnerIndividual = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: null,
          trustees_nature_of_control_types: null,
          trust_control_nature_of_control_types: null,
          non_legal_firm_members_nature_of_control_types: null,
          non_legal_firm_control_nature_of_control_types: null,
          owner_of_land_person_nature_of_control_jurisdictions: null,
          owner_of_land_other_entity_nature_of_control_jurisdictions: null
        };
        const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_URL)
          .send(beneficialOwnerIndividual);
        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
        expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      });
    });
  });

  describe("POST with url params tests", () => {
    test(`redirects to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);
    });

    test(`redirects to ${BENEFICIAL_OWNER_TYPE_PAGE} page when date of birth contains spaces`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const submissionMock = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK };
      submissionMock["date_of_birth-day"] = " 1 ";
      submissionMock["date_of_birth-month"] = " 1 ";
      submissionMock["date_of_birth-year"] = " 2000 ";

      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(submissionMock);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL);

      // Additionally check that date fields are trimmed before they're saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["date_of_birth-day"]).toEqual("1");
      expect(data["date_of_birth-month"]).toEqual("1");
      expect(data["date_of_birth-year"]).toEqual("2000");
    });

    test(`POST only radio buttons choices and do not redirect to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => { return BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS; } );
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_RADIO_BUTTONS);

      expect(resp.status).toEqual(200);
      expect(resp.header.location).not.toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirect to the ${BENEFICIAL_OWNER_TYPE_PAGE} page after a successful post from ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with service address data`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      mockPrepareData.mockReturnValueOnce( { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO } );
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`POST empty object and do not redirect to ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockPrepareData.mockImplementationOnce( () => REQ_BODY_BENEFICIAL_OWNER_INDIVIDUAL_EMPTY );

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test(`adds data to the session and redirects to the ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerIndividualKey);
      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
    });

    test(`correctly maps natures of controle when feature flag FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
      mockPrepareData.mockImplementationOnce( () => {
        return {
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
          non_legal_firm_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
          trust_control_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES],
          owner_of_land_person_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.ENGLAND_AND_WALES],
          owner_of_land_other_entity_nature_of_control_jurisdictions: [NatureOfControlJurisdiction.NORTHERN_IRELAND]
        };
      });

      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send({
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
        });

      const appData: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];

      expect(appData[TrustControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(appData[NonLegalFirmControlNoc]).toEqual([NatureOfControlType.OVER_25_PERCENT_OF_SHARES]);
      expect(appData[OwnerOfLandPersonJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.ENGLAND_AND_WALES]);
      expect(appData[OwnerOfLandOtherEntityJurisdictionsNoc]).toEqual([NatureOfControlJurisdiction.NORTHERN_IRELAND]);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with MAX error messages`, async () => {
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      mockPrepareData.mockReturnValueOnce( { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO } );
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page is empty when same address is set to yes`, async () => {
      mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_YES);
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "0";
      beneficialOwnerIndividual["start_date-month"] = "11";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when start date month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["start_date-day"] = "30";
      beneficialOwnerIndividual["start_date-month"] = "0";
      beneficialOwnerIndividual["start_date-year"] = "2020";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST_OR_TODAY error when start_date is in the future`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["start_date-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["start_date-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["start_date-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
        .post(config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with error if Start date before DOB`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["date_of_birth-day"] = "1";
      beneficialOwnerIndividual["date_of_birth-month"] = "1";
      beneficialOwnerIndividual["date_of_birth-year"] = "2000";
      beneficialOwnerIndividual["start_date-day"] = "1";
      beneficialOwnerIndividual["start_date-month"] = "1";
      beneficialOwnerIndividual["start_date-year"] = "1999";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.START_DATE_MUST_BE_AFTER_DOB);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page without error if Start date same as DOB`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_START_DATE };
      beneficialOwnerIndividual["date_of_birth-day"] = "1";
      beneficialOwnerIndividual["date_of_birth-month"] = "1";
      beneficialOwnerIndividual["date_of_birth-year"] = "2000";
      beneficialOwnerIndividual["start_date-day"] = "1";
      beneficialOwnerIndividual["start_date-month"] = "1";
      beneficialOwnerIndividual["start_date-year"] = "2000";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).not.toContain(ErrorMessages.START_DATE_MUST_BE_AFTER_DOB);
    });

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only ENTER_DATE_OF_BIRTH error when date of birth is completely empty`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "";
      beneficialOwnerIndividual["date_of_birth-month"] = "";
      beneficialOwnerIndividual["date_of_birth-year"] = "";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth day is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "0";
      beneficialOwnerIndividual["date_of_birth-month"] = "11";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only INVALID_DATE error when date of birth month is zero`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      beneficialOwnerIndividual["date_of_birth-day"] = "30";
      beneficialOwnerIndividual["date_of_birth-month"] = "0";
      beneficialOwnerIndividual["date_of_birth-year"] = "1970";
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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

    test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with only DATE_NOT_IN_PAST error when date of birth is in the future`, async () => {
      const beneficialOwnerIndividual = { ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK_FOR_DATE_OF_BIRTH };
      const inTheFuture = DateTime.now().plus({ days: 1 });
      beneficialOwnerIndividual["date_of_birth-day"] = inTheFuture.day.toString();
      beneficialOwnerIndividual["date_of_birth-month"] = inTheFuture.month.toString();
      beneficialOwnerIndividual["date_of_birth-year"] = inTheFuture.year.toString();

      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
        .post(config.BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
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
      const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
        .send(beneficialOwnerIndividual);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SECOND_NATIONALITY_IS_SAME);
    });

    describe("Nature of controls tests with url params", () => {

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null],
        ["Trustee Noc", null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null],
        ["Non legal firm Noc", null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS]]
      ])(`redirect to the ${BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control - %s`, async (_desc, boNoc, trusteeNoc, nonLegalNoc) => {
        mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

        const body = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: boNoc,
          trustees_nature_of_control_types: trusteeNoc,
          non_legal_firm_members_nature_of_control_types: nonLegalNoc,
        };

        const resp = await request(app)
          .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      });

      test.each([
        ["BO Noc", [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null, null, null],
        ["Trustee Noc", null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null, null],
        ["Trust control Noc", null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null, null],
        ["Non legal firm Noc", null, null, null, [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS], null, null],
        ["Owner of land person Noc", null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES], null],
        ["Owner of land other entitiy Noc", null, null, null, null, null, [NatureOfControlJurisdiction.ENGLAND_AND_WALES]],
      ])(`redirect to the ${BENEFICIAL_OWNER_TYPE_PAGE} page when page data includes a nature of control and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON - %s`, async (_desc, boNoc, trusteeNoc, trustControlNoc, nonLegalNoc, landPersonNoc, landOtherEntityNoc) => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        mockPrepareData.mockImplementationOnce( () => BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK );

        const body = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: boNoc,
          trustees_nature_of_control_types: trusteeNoc,
          trust_control_nature_of_control_types: trustControlNoc,
          non_legal_firm_members_nature_of_control_types: nonLegalNoc,
          owner_of_land_person_nature_of_control_jurisdictions: landPersonNoc,
          owner_of_land_other_entity_nature_of_control_jurisdictions: landOtherEntityNoc
        };

        const resp = await request(app)
          .post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
          .send(body);

        expect(resp.status).toEqual(302);
        expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      });

      test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with nature of control error when no nature of control is provided`, async () => {
        const beneficialOwnerIndividual = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: null,
          trustees_nature_of_control_types: null,
          non_legal_firm_members_nature_of_control_types: null,
        };
        const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
          .send(beneficialOwnerIndividual);
        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
        expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      });

      test(`renders the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page with nature of control error when no nature of control is provided and FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC is ON`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC
        mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
        mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC

        const beneficialOwnerIndividual = {
          ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
          beneficial_owner_nature_of_control_types: null,
          trustees_nature_of_control_types: null,
          trust_control_nature_of_control_types: null,
          non_legal_firm_members_nature_of_control_types: null,
          owner_of_land_person_nature_of_control_jurisdictions: null,
          owner_of_land_other_entity_nature_of_control_jurisdictions: null
        };
        const resp = await request(app).post(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL)
          .send(beneficialOwnerIndividual);
        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_INDIVIDUAL_PAGE_HEADING);
        expect(resp.text).toContain(ErrorMessages.SELECT_NATURE_OF_CONTROL);
      });
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_PAGE} page`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);

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
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_REPLACE);
      const resp = await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REPLACE);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerIndividualKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_IND_ID);

      const data = mockSetApplicationData.mock.calls[0][1];
      expect(data.id).toEqual(BO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(BO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(BeneficialOwnerIndividualKey);

      // Ensure that trust ids on the original BO aren't lost during the update
      expect((data as BeneficialOwnerIndividual).trust_ids).toEqual(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK.trust_ids);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} is present when same address is set to no`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
      mockPrepareData.mockReturnValueOnce( { ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK_WITH_SERVICE_ADDRESS_NO } );
      await request(app)
        .post(BENEFICIAL_OWNER_INDIVIDUAL_URL + BO_IND_ID_URL)
        .send(BENEFICIAL_OWNER_INDIVIDUAL_REQ_BODY_OBJECT_MOCK);

      expect(mapFieldsToDataObject).toHaveBeenCalledWith(expect.anything(), ServiceAddressKeys, AddressKeys);
      const data: ApplicationDataType = mockSetApplicationData.mock.calls[0][1];
      expect(data[ServiceAddressKey]).toEqual(DUMMY_DATA_OBJECT);
    });

    test(`Service address from the ${BENEFICIAL_OWNER_INDIVIDUAL_PAGE} is empty when same address is set to yes`, async () => {
      mockGetFromApplicationData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);
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

  describe("REMOVE with url params tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // For FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockPrepareData.mockReturnValueOnce(BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK);

      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + REMOVE + BO_IND_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("catch error when removing data", async () => {
      mockRemoveFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + REMOVE + BO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(BENEFICIAL_OWNER_INDIVIDUAL_WITH_PARAMS_URL + REMOVE + BO_IND_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(BeneficialOwnerIndividualKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(BO_IND_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });
});
