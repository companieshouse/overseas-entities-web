import { saveAndContinue } from "../../src/utils/save.and.continue";

jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.due.diligence.middleware');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { DUE_DILIGENCE_URL, ENTITY_PAGE, ENTITY_URL, LANDING_PAGE_URL, OVERSEAS_ENTITY_DUE_DILIGENCE_URL } from "../../src/config";
import { getApplicationData, setApplicationData, prepareData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  APPLICATION_DATA_MOCK,
  ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS,
  ENTITY_OBJECT_MOCK,
  ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS,
} from "../__mocks__/session.mock";
import {
  BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT,
  ENTITY_PAGE_TITLE,
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  ALL_OTHER_INFORMATION_ON_PUBLIC_REGISTER,
  OVERSEAS_ENTITY_NO_EMAIL_SHOWN_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  INCORPORATION_COUNTRY_OPTION_SELECTED,
  UNITED_KINGDOM_COUNTRY_OPTION_SELECTED,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
} from "../__mocks__/text.mock";
import { HasSamePrincipalAddressKey, IsOnRegisterInCountryFormedInKey, PublicRegisterNameKey, RegistrationNumberKey } from '../../src/model/data.types.model';
import { ErrorMessages } from '../../src/validation/error.messages';
import { EntityKey } from '../../src/model/entity.model';
import {
  ENTITY_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  ENTITY_WITH_MAX_LENGTH_FIELDS_MOCK
} from '../__mocks__/validation.mock';
import { hasDueDiligence } from "../../src/middleware/navigation/has.due.diligence.middleware";
import { WhoIsRegisteringKey, WhoIsRegisteringType } from '../../src/model/who.is.making.filing.model';

const mockHasDueDiligenceMiddleware = hasDueDiligence as jest.Mock;
mockHasDueDiligenceMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("ENTITY controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test(`renders the ${ENTITY_PAGE} page with ${DUE_DILIGENCE_URL} back link`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [EntityKey]: null, [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT } );
      const resp = await request(app).get(ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(LANDING_PAGE_URL);
      expect(resp.text).toContain(ALL_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_NO_EMAIL_SHOWN_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(DUE_DILIGENCE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test(`renders the ${ENTITY_PAGE} page with ${OVERSEAS_ENTITY_DUE_DILIGENCE_URL} back link`, async () => {
      mockGetApplicationData.mockReturnValueOnce( { [EntityKey]: null, [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE } );
      const resp = await request(app).get(ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(ALL_OTHER_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_NO_EMAIL_SHOWN_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the entity page on GET method with session data populated", async () => {
      mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
      const resp = await request(app).get(ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(ENTITY_OBJECT_MOCK.legal_form);
      expect(resp.text).toContain(ENTITY_OBJECT_MOCK.email);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the entity page on GET method with Taiwan as country field", async () => {
      mockGetApplicationData.mockReturnValueOnce( {
        ...APPLICATION_DATA_MOCK,
        [EntityKey]: {
          ...APPLICATION_DATA_MOCK[EntityKey],
          incorporation_country: "Taiwan",
          principal_address_country: "United Kingdom"
        }
      });
      const resp = await request(app).get(ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(INCORPORATION_COUNTRY_OPTION_SELECTED);
      expect(resp.text).toContain(UNITED_KINGDOM_COUNTRY_OPTION_SELECTED);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the entity page on GET method without United Kingdom on incorporation country", async () => {
      mockGetApplicationData.mockReturnValueOnce( {
        ...APPLICATION_DATA_MOCK,
        [EntityKey]: {
          ...APPLICATION_DATA_MOCK[EntityKey],
          incorporation_country: "United Kingdom"
        }
      });
      const resp = await request(app).get(ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(UNITED_KINGDOM_COUNTRY_OPTION_SELECTED);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when renders the entity page on GET method", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(ENTITY_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test("redirect the beneficial owner type page after a successful post from ENTITY page", async () => {
      mockPrepareData.mockReturnValueOnce( ENTITY_OBJECT_MOCK );
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("redirect to the next page page after a successful post from ENTITY page with service address data", async () => {
      mockPrepareData.mockReturnValueOnce( ENTITY_OBJECT_MOCK_WITH_SERVICE_ADDRESS );
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("redirect to the next page page after a successful post from ENTITY page without the selection option", async () => {
      mockPrepareData.mockReturnValueOnce( { ...ENTITY_OBJECT_MOCK, [HasSamePrincipalAddressKey]: "" } );
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("redirect to the next page page after a successful post from ENTITY page without the register option", async () => {
      mockPrepareData.mockReturnValueOnce( { ...ENTITY_OBJECT_MOCK, [IsOnRegisterInCountryFormedInKey]: "" } );
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_REDIRECT);

      const data = mockSetApplicationData.mock.calls[0][1];
      expect(data[PublicRegisterNameKey]).toEqual('');
      expect(data[RegistrationNumberKey]).toEqual('');
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error messages", async () => {
      mockPrepareData.mockReturnValueOnce( ENTITY_OBJECT_MOCK );
      const resp = await request(app).post(ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(ENTITY_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with public register error messages", async () => {
      mockPrepareData.mockReturnValueOnce( ENTITY_OBJECT_MOCK );
      const resp = await request(app)
        .post(ENTITY_URL)
        .send({ is_on_register_in_country_formed_in: "1", public_register_name: "       " });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(resp.text).toContain(OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with MAX error messages", async () => {
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_PROPERTY_NAME_OR_NUMBER_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE1_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ADDRESS_LINE2_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_CITY_OR_TOWN_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_COUNTY_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_POSTCODE_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(ErrorMessages.MAX_ENTITY_LEGAL_FORM_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ENTITY_LAW_GOVERNED_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ENTITY_PUBLIC_REGISTER_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_ENTITY_PUBLIC_REGISTER_NUMBER_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.ENTITY_NAME);
      expect(resp.text).not.toContain(ErrorMessages.COUNTRY);
      expect(resp.text).not.toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).not.toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).not.toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_PRINCIPAL_ADDRESS);
      expect(resp.text).not.toContain(ErrorMessages.LEGAL_FORM);
      expect(resp.text).not.toContain(ErrorMessages.LAW_GOVERNED);
      expect(resp.text).not.toContain(ErrorMessages.SELECT_IF_REGISTER_IN_COUNTRY_FORMED_IN);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NAME);
      expect(resp.text).not.toContain(ErrorMessages.PUBLIC_REGISTER_NUMBER);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("renders the current page with INVALID CHARACTERS error messages", async () => {
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ENTITY_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.ENTITY_NAME_INVALID_CHARACTERS);
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
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("catch error when post data from ENTITY page", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(ENTITY_URL)
        .send(ENTITY_BODY_OBJECT_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });
});
