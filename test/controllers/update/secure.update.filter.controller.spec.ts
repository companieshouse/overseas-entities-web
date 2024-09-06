import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";

jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/feature.flag" );
jest.mock("../../../src/utils/url");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";
import {
  JOURNEY_REMOVE_QUERY_PARAM,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
  REMOVE_SERVICE_NAME,
  SECURE_UPDATE_FILTER_PAGE,
  SECURE_UPDATE_FILTER_URL,
  UPDATE_INTERRUPT_CARD_URL,
  UPDATE_LANDING_PAGE_URL,
  UPDATE_SERVICE_NAME,
  UPDATE_USE_PAPER_URL
} from "../../../src/config";
import { ErrorMessages } from "../../../src/validation/error.messages";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SECURE_UPDATE_FILTER_PAGE_HEADING,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";

import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { isRemoveJourney } from "../../../src/utils/url";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockIsRemoveJourney = isRemoveJourney as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;

describe("SECURE UPDATE FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockIsRemoveJourney.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);

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
      mockGetApplicationData.mockReturnValueOnce({});
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
      mockGetApplicationData.mockReturnValueOnce({ is_secure_register: 0 });
      const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`renders the ${SECURE_UPDATE_FILTER_PAGE} page with radios selected to yes`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ is_secure_register: 1 });
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
    test ("if REDIS_removal flag is OFF redirect toupdate-interrupt-card", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(false);

      const resp = await request(app)
        .post(SECURE_UPDATE_FILTER_URL)
        .send({ is_secure_register: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_INTERRUPT_CARD_URL);
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
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
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
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
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
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
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
