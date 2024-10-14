jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/service/transaction.service');
jest.mock('../../../src/service/overseas.entities.service');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";

import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { ApplicationDataType } from '../../../src/model';
import { PresenterKey } from '../../../src/model/presenter.model';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { createOverseasEntity } from "../../../src/service/overseas.entities.service";
import { postTransaction } from "../../../src/service/transaction.service";

import {
  OVERSEAS_ENTITY_PRESENTER_URL,
  JOURNEY_REMOVE_QUERY_PARAM,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
  UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL,
  UPDATE_PRESENTER_PAGE
} from "../../../src/config";

import {
  getApplicationData,
  prepareData,
  setApplicationData,
  setExtraData,
  fetchApplicationData
} from "../../../src/utils/application.data";

import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE,
  SERVICE_UNAVAILABLE,
  UPDATE_USE_INFORMATION_NEED_MORE,
  REMOVE_OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE,
  REMOVE_USE_INFORMATION_NEED_MORE,
  SAVE_AND_CONTINUE_BUTTON_TEXT,
} from '../../__mocks__/text.mock';

import {
  EMAIL_ADDRESS,
  APPLICATION_DATA_MOCK,
  PRESENTER_OBJECT_MOCK,
  PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES,
  OVERSEAS_ENTITY_ID,
  TRANSACTION_ID
} from '../../__mocks__/session.mock';

import {
  PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK,
  PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK,
  PRESENTER_WITH_SPECIAL_CHARACTERS_FIELDS_MOCK
} from '../../__mocks__/validation.mock';

import {
  IsRemoveKey,
  OverseasEntityKey,
  Transactionkey,
  EntityNumberKey
} from '../../../src/model/data.types.model';

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

const mockSetApplicationData = setApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockPrepareData = prepareData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockTransactionService = postTransaction as jest.Mock;
mockTransactionService.mockReturnValue( TRANSACTION_ID );

const mockCreateOverseasEntity = createOverseasEntity as jest.Mock;
mockCreateOverseasEntity.mockReturnValue( OVERSEAS_ENTITY_ID );

describe("OVERSEAS ENTITY PRESENTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetApplicationData.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the presenter page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [PresenterKey]: PRESENTER_OBJECT_MOCK, [EntityNumberKey]: "OE123456" });
      const resp = await request(app).get(OVERSEAS_ENTITY_PRESENTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UPDATE_USE_INFORMATION_NEED_MORE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER);
    });

    test("catch error when renders the overseas entity presenter page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetApplicationData.mockReturnValueOnce({ [PresenterKey]: PRESENTER_OBJECT_MOCK, [EntityNumberKey]: "OE123456" });
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(OVERSEAS_ENTITY_PRESENTER_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe ("GET tests for remove journey", () => {

    test(`renders the ${UPDATE_PRESENTER_PAGE} page for remove`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [PresenterKey]: PRESENTER_OBJECT_MOCK, [EntityNumberKey]: "OE123457" });
      const resp = await request(app).get(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(REMOVE_USE_INFORMATION_NEED_MORE);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page after a successful post from overseas entity presenter page`, async () => {
      const resp = await request(app).post(OVERSEAS_ENTITY_PRESENTER_URL).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirect to the ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page after a successful post from overseas entity presenter page with special characters`, async () => {
      const resp = await request(app).post(OVERSEAS_ENTITY_PRESENTER_URL).send(PRESENTER_WITH_SPECIAL_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(OVERSEAS_ENTITY_PRESENTER_URL).send({ email: '' });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(OVERSEAS_ENTITY_PRESENTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("renders the current page with MAX error messages", async () => {
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_PRESENTER_URL)
        .send(PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_FULL_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.FULL_NAME);
    });

    test("renders the current page with INVALID_CHARACTERS error message for full name and email", async () => {
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_PRESENTER_URL)
        .send(PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_PRESENTER_URL)
        .send(PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["email"]).toEqual(EMAIL_ADDRESS);
    });

    test("catch error when post data from overseas entity presenter page", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(OVERSEAS_ENTITY_PRESENTER_URL).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("Test email is valid if email name and address is greater than 100 characters but less than 256", async () => {
      const presenter = {
        ...PRESENTER_OBJECT_MOCK,
        email: "socarrollA89F12345678910XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const resp = await request(app)
        .post(OVERSEAS_ENTITY_PRESENTER_URL)
        .send(presenter);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });

    test(`Saves transaction and OE submission with 'isRemove' flag set on POST if this is a Remove journey`, async () => {
      const mockData = { ...APPLICATION_DATA_MOCK, [Transactionkey]: "", [OverseasEntityKey]: "" };
      mockGetApplicationData.mockReturnValue(mockData);

      const resp = await request(app).post(
        `${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(302);

      expect(mockData[Transactionkey]).toEqual(TRANSACTION_ID);
      expect(mockData[OverseasEntityKey]).toEqual(OVERSEAS_ENTITY_ID);
      expect(mockData[IsRemoveKey]).toEqual(true);
      expect(mockTransactionService).toHaveBeenCalledTimes(1);
      expect(mockCreateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);

      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);
    });
  });

  describe("POST tests on a remove journey", () => {
    test(`redirect to ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE} page after a successful post from overseas entity presenter page`, async () => {
      const resp = await request(app).post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test(`redirect to the ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE}${JOURNEY_REMOVE_QUERY_PARAM} page after a successful post from overseas entity presenter page with special characters`, async () => {
      const resp = await request(app).post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`).send(PRESENTER_WITH_SPECIAL_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`).send({ email: '' });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).toContain(`${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
    });

    test("renders the current page with MAX error messages", async () => {
      const resp = await request(app)
        .post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`)
        .send(PRESENTER_WITH_MAX_LENGTH_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.MAX_FULL_NAME_LENGTH);
      expect(resp.text).toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.FULL_NAME);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
    });

    test("renders the current page with INVALID_CHARACTERS error message for full name and email", async () => {
      const resp = await request(app)
        .post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`)
        .send(PRESENTER_WITH_INVALID_CHARACTERS_FIELDS_MOCK);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_OVERSEAS_ENTITY_PRESENTER_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.FULL_NAME_INVALID_CHARACTERS);
      expect(resp.text).toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
    });

    test("renders the next page and no errors are reported if email has leading and trailing spaces", async () => {
      const resp = await request(app)
        .post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`)
        .send(PRESENTER_OBJECT_MOCK_WITH_EMAIL_CONTAINING_LEADING_AND_TRAILING_SPACES);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(`${FOUND_REDIRECT_TO} ${UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL}`);

      // Additionally check that email address is trimmed before it's saved in the session
      const data: ApplicationDataType = mockPrepareData.mock.calls[0][0];
      expect(data["email"]).toEqual(EMAIL_ADDRESS);
    });

    test("catch error when post data from overseas entity presenter page", async () => {
      mockSetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`).send(PRESENTER_OBJECT_MOCK);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test("Test email is valid if email name and address is greater than 100 characters but less than 256", async () => {
      const presenter = {
        ...PRESENTER_OBJECT_MOCK,
        email: "socarrollA89F12345678910XX@T123465798U123456789V123456789W123456789X123456789Y123456.companieshouse.gov.uk" };
      const resp = await request(app)
        .post(`${OVERSEAS_ENTITY_PRESENTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`)
        .send(presenter);
      expect(resp.status).toEqual(302);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL);
      expect(resp.text).not.toContain(ErrorMessages.MAX_EMAIL_LENGTH);
      expect(resp.text).not.toContain(ErrorMessages.EMAIL_INVALID_FORMAT);
    });
  });
});
