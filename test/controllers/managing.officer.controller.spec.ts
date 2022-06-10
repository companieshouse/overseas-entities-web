jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock("../../src/utils/logger");

import { describe, expect, test, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_PAGE, MANAGING_OFFICER_URL, REMOVE } from "../../src/config";
import { getFromApplicationData, prepareData, removeFromApplicationData, setApplicationData } from '../../src/utils/application.data';
import {
  MANAGING_OFFICER_OBJECT_MOCK,
  MO_IND_ID,
  MO_IND_ID_URL,
  REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS,
  REQ_BODY_MANAGING_OFFICER_OBJECT_EMPTY,
} from "../__mocks__/session.mock";
import { ANY_MESSAGE_ERROR, MANAGING_OFFICER, MANAGING_OFFICER_PAGE_HEADING, SERVICE_UNAVAILABLE } from '../__mocks__/text.mock';
import { managingOfficerType } from '../../src/model';
import { ErrorMessages } from '../../src/validation/error.messages';
import { HasFormerNames, HasSameResidentialAddressKey } from '../../src/model/data.types.model';
import { MANAGING_OFFICER_INDIVIDUAL_WITH_MAX_LENGTH_FIELDS_MOCK } from '../__mocks__/validation.mock';
import { logger } from "../../src/utils/logger";
import { ManagingOfficerIndividual, ManagingOfficerKey } from '../../src/model/managing.officer.model';
import { MANAGING_OFFICER_INDIVIDUAL_VALID_FORM_DATA_MOCK } from '../__mocks__/page.form.data.mock';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetFromApplicationData = getFromApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockPrepareData = prepareData as jest.Mock;
const mockRemoveFromApplicationData = removeFromApplicationData as unknown as jest.Mock;

describe("MANAGING_OFFICER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${MANAGING_OFFICER_PAGE} page`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
    });
  });

  describe("GET BY ID tests", () => {

    test("renders the managing officer page", async () => {
      mockGetFromApplicationData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(MANAGING_OFFICER_PAGE_HEADING);
      expect(resp.text).toContain(MANAGING_OFFICER);
      expect(resp.text).toContain("Utopian");
    });

    test("catch error when rendering the page", async () => {
      mockGetFromApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_URL + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`renders the ${BENEFICIAL_OWNER_TYPE_URL} page after all mandandory fields for ${MANAGING_OFFICER_URL} have been populated`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test(`sets session data and renders the ${BENEFICIAL_OWNER_TYPE_URL} page after all mandandory fields for ${MANAGING_OFFICER_URL} have been populated`, async () => {
      mockPrepareData.mockImplementationOnce( () => MANAGING_OFFICER_OBJECT_MOCK );

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      const beneficialOwnerIndividual = mockSetApplicationData.mock.calls[0][1];

      expect(beneficialOwnerIndividual).toEqual(MANAGING_OFFICER_OBJECT_MOCK);
      expect(beneficialOwnerIndividual.first_name).toEqual("Joe");
      expect(beneficialOwnerIndividual.nationality).toEqual("Utopian");
      expect(beneficialOwnerIndividual.occupation).toEqual("Some Occupation");
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(managingOfficerType.ManagingOfficerKey);
      expect(resp.status).toEqual(302);

      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });


    test(`POST only radio buttons choices and redirect to ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockImplementationOnce( () =>  { return { [HasSameResidentialAddressKey]: 0, [HasFormerNames]: 0 }; } );

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when posting data", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app)
        .post(MANAGING_OFFICER_URL)
        .send(REQ_BODY_MANAGING_OFFICER_MOCK_WITH_ADDRESS);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
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
      expect(resp.text).toContain(ErrorMessages.DAY_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.MONTH_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.YEAR_OF_BIRTH);
      expect(resp.text).toContain(ErrorMessages.NATIONALITY);
      expect(resp.text).toContain(ErrorMessages.PROPERTY_NAME_OR_NUMBER);
      expect(resp.text).toContain(ErrorMessages.ADDRESS_LINE1);
      expect(resp.text).toContain(ErrorMessages.CITY_OR_TOWN);
      expect(resp.text).toContain(ErrorMessages.COUNTRY);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SERVICE_ADDRESS_SAME_AS_USER_RESIDENTIAL_ADDRESS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_URL);
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
    });
  });

  describe("UPDATE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_VALID_FORM_DATA_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when updating data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_VALID_FORM_DATA_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`replaces existing object on submit`, async () => {
      const newMoData: ManagingOfficerIndividual = { id: MO_IND_ID, first_name: "new name" };
      mockPrepareData.mockReturnValueOnce(newMoData);
      const resp = await request(app)
        .post(MANAGING_OFFICER_URL + MO_IND_ID_URL)
        .send(MANAGING_OFFICER_INDIVIDUAL_VALID_FORM_DATA_MOCK);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(mockSetApplicationData.mock.calls[0][1].id).toEqual(MO_IND_ID);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(ManagingOfficerKey);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });
  });

  describe("REMOVE tests", () => {
    test(`redirects to the ${BENEFICIAL_OWNER_TYPE_URL} page`, async () => {
      mockPrepareData.mockReturnValueOnce(MANAGING_OFFICER_OBJECT_MOCK);
      const resp = await request(app).get(MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });

    test("catch error when removing data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`removes the object from session`, async () => {
      const resp = await request(app).get(MANAGING_OFFICER_URL + REMOVE + MO_IND_ID_URL);

      expect(mockRemoveFromApplicationData.mock.calls[0][1]).toEqual(ManagingOfficerKey);
      expect(mockRemoveFromApplicationData.mock.calls[0][2]).toEqual(MO_IND_ID);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(BENEFICIAL_OWNER_TYPE_URL);
    });
  });
});
