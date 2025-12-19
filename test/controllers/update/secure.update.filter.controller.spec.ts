jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/service/transaction.service');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock("../../../src/utils/feature.flag" );
jest.mock("../../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";

import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { postTransaction } from "../../../src/service/transaction.service";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import { setExtraData, fetchApplicationData } from "../../../src/utils/application.data";
import { createOverseasEntity, updateOverseasEntity } from "../../../src/service/overseas.entities.service";

import {
  isRemoveJourney,
  isUpdateJourney,
  isRegistrationJourney,
  getUrlWithTransactionIdAndSubmissionId
} from "../../../src/utils/url";

import {
  TRANSACTION_ID,
  APPLICATION_DATA_MOCK,
} from "../../__mocks__/session.mock";

import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SECURE_UPDATE_FILTER_PAGE_HEADING,
} from "../../__mocks__/text.mock";

import {
  REMOVE_SERVICE_NAME,
  UPDATE_SERVICE_NAME,
  UPDATE_USE_PAPER_URL,
  UPDATE_LANDING_PAGE_URL,
  SECURE_UPDATE_FILTER_URL,
  SECURE_UPDATE_FILTER_PAGE,
  UPDATE_INTERRUPT_CARD_URL,
  JOURNEY_REMOVE_QUERY_PARAM,
  SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
} from "../../../src/config";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockIsRemoveJourney = isRemoveJourney as jest.Mock;
const MOCKED_PAGE_URL = "/MOCKED_PAGE";

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(false);

const mockIsUpdateJourney = isUpdateJourney as jest.Mock;
mockIsUpdateJourney.mockReturnValue(true);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetUrlWithTransactionIdAndSubmissionId = getUrlWithTransactionIdAndSubmissionId as jest.Mock;
mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValue(MOCKED_PAGE_URL);

const mockPostTransactionService = postTransaction as jest.Mock;
mockPostTransactionService.mockReturnValue(TRANSACTION_ID);

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;
const mockCreateOverseasEntity = createOverseasEntity as jest.Mock;

describe("SECURE UPDATE FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockIsRemoveJourney.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page when REDIS_removal flag is set to OFF`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_SERVICE_NAME);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page when REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockFetchApplicationData.mockReturnValueOnce({});

      const resp = await request(app).get(SECURE_UPDATE_FILTER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_SERVICE_NAME);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page for remove`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(true);
      const resp = await request(app).get(`${SECURE_UPDATE_FILTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page with radios selected to no`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ is_secure_register: 0 });
      const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page with radios selected to yes`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ is_secure_register: 1 });
      const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test ("if REDIS_removal flag is OFF redirect to update-interrupt-card", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(false);

      const resp = await request(app)
        .post(SECURE_UPDATE_FILTER_URL)
        .send({ is_secure_register: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_INTERRUPT_CARD_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test ("if REDIS_removal flag is ON, update the entity when transactionKey and overseasEntityKey are present, and redirect to update-interrupt-card, with entity IDs in URL", async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsRemoveJourney.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);
      mockCreateOverseasEntity.mockReturnValueOnce(false);

      const resp = await request(app)
        .post(SECURE_UPDATE_FILTER_WITH_PARAMS_URL)
        .send({ is_secure_register: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(MOCKED_PAGE_URL);
      expect(mockCreateOverseasEntity).not.toHaveBeenCalled();
      expect(mockGetUrlWithTransactionIdAndSubmissionId).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(SECURE_UPDATE_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SECURE_REGISTER_FILTER);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(SECURE_UPDATE_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(SECURE_UPDATE_FILTER_URL)
        .send({ is_secure_register: '0' });
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests for remove journey", () => {

    test(`redirect to ${UPDATE_INTERRUPT_CARD_URL}${JOURNEY_REMOVE_QUERY_PARAM} when no is selected and REDIS_removal flag is OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(true);

      const resp = await request(app)
        .post(`${SECURE_UPDATE_FILTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ is_secure_register: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${UPDATE_INTERRUPT_CARD_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirect to ${UPDATE_USE_PAPER_URL}${JOURNEY_REMOVE_QUERY_PARAM} when yes is selected and REDIS_removal flag is OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(true);

      const resp = await request(app)
        .post(`${SECURE_UPDATE_FILTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ is_secure_register: '1' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${UPDATE_USE_PAPER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(`${SECURE_UPDATE_FILTER_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SECURE_REGISTER_FILTER);
    });
  });
});
