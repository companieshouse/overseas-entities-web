import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";

jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.sold.land.middleware');
jest.mock("../../src/middleware/service.availability.middleware");
jest.mock("../../src/middleware/navigation/remove/remove.journey.middleware");
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');
jest.mock('../../src/utils/feature.flag');
jest.mock("../../src/utils/url");

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../__mocks__/remove.journey.middleware.mock";

import app from "../../src/app";
import * as config from "../../src/config";
import { ErrorMessages } from "../../src/validation/error.messages";
import {
  ANY_MESSAGE_ERROR,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SECURE_REGISTER_FILTER_PAGE_HEADING,
  SERVICE_UNAVAILABLE,
  BACK_BUTTON_CLASS
} from "../__mocks__/text.mock";
import {
  SECURE_REGISTER_FILTER_URL,
  SECURE_REGISTER_FILTER_WITH_PARAMS_URL,
  SOLD_LAND_FILTER_URL
} from "../../src/config";

import { getApplicationData, setExtraData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from "../../src/utils/logger";
import { hasSoldLand } from "../../src/middleware/navigation/has.sold.land.middleware";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { isRemoveJourney, getUrlWithTransactionIdAndSubmissionId } from "./../../src/utils/url";
import { updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { getUrlWithParamsToPath } from "../../src/utils/url";

mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasSoldLandMiddleware = hasSoldLand as jest.Mock;
mockHasSoldLandMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

mockRemoveJourneyMiddleware.mockClear();

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockIsRemoveJourney = isRemoveJourney as jest.Mock;
const mockGetUrlWithTransactionIdAndSubmissionId = getUrlWithTransactionIdAndSubmissionId as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;

describe( "SECURE REGISTER FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    mockIsRemoveJourney.mockReset();
    mockGetUrlWithParamsToPath.mockReset();
  });

  describe("GET tests", () => {

    test(`renders the ${config.SECURE_REGISTER_FILTER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(SOLD_LAND_FILTER_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER);
    });

    test(`renders the ${config.SECURE_REGISTER_FILTER_PAGE} page and REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetUrlWithParamsToPath.mockReturnValueOnce('/some-url');
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsRemoveJourney.mockReturnValue(false);
      const resp = await request(app).get(SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(SOLD_LAND_FILTER_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).not.toHaveBeenCalled();
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockIsRemoveJourney).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.SECURE_REGISTER_FILTER_PAGE} page and REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetUrlWithParamsToPath.mockReturnValueOnce('/some-url');
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsRemoveJourney.mockReturnValue(false);
      const resp = await request(app).get(SECURE_REGISTER_FILTER_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(SOLD_LAND_FILTER_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
      expect(resp.text).toContain(NOT_SHOW_INFORMATION_ON_PUBLIC_REGISTER);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockIsRemoveJourney).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.SECURE_REGISTER_FILTER_PAGE} page with radios selected to no`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ is_secure_register: 0 });
      const resp = await request(app).get(SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_NO_SELECTED);
    });

    test(`renders the ${config.SECURE_REGISTER_FILTER_PAGE} page with radios selected to yes`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ is_secure_register: 1 });
      const resp = await request(app).get(SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_YES_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.SECURE_REGISTER_FILTER_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${config.USE_PAPER_PAGE} page when yes is selected and REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ is_secure_register: "1" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.USE_PAPER_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
    });

    test(`renders the ${config.USE_PAPER_PAGE} page when yes is selected and REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsRemoveJourney.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ is_secure_register: "1" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.USE_PAPER_WITH_PARAMS_URL);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.INTERRUPT_CARD_PAGE} page when no is selected and REDIS_removal flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsRemoveJourney.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ is_secure_register: "0" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.INTERRUPT_CARD_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
    });

    test(`renders the ${config.INTERRUPT_CARD_PAGE} page when no is selected and REDIS_removal flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsRemoveJourney.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);
      mockGetUrlWithTransactionIdAndSubmissionId.mockReturnValueOnce(config.INTERRUPT_CARD_WITH_PARAMS_URL);
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_WITH_PARAMS_URL)
        .send({ is_secure_register: "0" });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.INTERRUPT_CARD_WITH_PARAMS_URL);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SECURE_REGISTER_FILTER);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.SECURE_REGISTER_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ is_secure_register: '0' });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

  });
});
