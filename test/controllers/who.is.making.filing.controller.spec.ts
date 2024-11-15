jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/navigation/has.presenter.middleware');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock("../../src/utils/url");
jest.mock('../../src/service/transaction.service');
jest.mock('../../src/service/overseas.entities.service');

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import * as config from "../../src/config";

import app from "../../src/app";

import { ErrorMessages } from '../../src/validation/error.messages';
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from "../../src/utils/logger";
import { hasPresenter } from "../../src/middleware/navigation/has.presenter.middleware";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { updateOverseasEntity } from "../../src/service/overseas.entities.service";
import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";

import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../src/model/who.is.making.filing.model";
import { isRegistrationJourney, getUrlWithParamsToPath } from "../../src/utils/url";
import { setExtraData, fetchApplicationData } from "../../src/utils/application.data";

import {
  ANY_MESSAGE_ERROR, BACK_BUTTON_CLASS,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_AGENT_SELECTED,
  RADIO_BUTTON_SOMEONE_ELSE_SELECTED,
  SERVICE_UNAVAILABLE,
  UK_REGULATED_AGENT,
  WHO_IS_MAKING_FILING_PAGE_TITLE,
} from "../__mocks__/text.mock";

mockCsrfProtectionMiddleware.mockClear();
const mockHasPresenterMiddleware = hasPresenter as jest.Mock;
mockHasPresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockSetExtraData = setExtraData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const NEXT_PAGE_URL = "/NEXT_PAGE";
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(NEXT_PAGE_URL);

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

describe("Who is making filing controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
    process.env.FEATURE_FLAG_ENABLE_REDIS_REMOVAL_27092023 = "false";
  });

  describe("GET tests", () => {

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_PAGE_TITLE);
      expect(resp.text).not.toContain(RADIO_BUTTON_AGENT_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UK_REGULATED_AGENT);
    });

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page with correct back link url when feature flag is off`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValue(false);
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.PRESENTER_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
    });

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page with correct back link url when feature flag is on`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValue(true);
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(NEXT_PAGE_URL);
      expect(resp.text).toContain(BACK_BUTTON_CLASS);
    });

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page with radios selected to ${WhoIsRegisteringType.AGENT}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_AGENT_SELECTED);
    });

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page with radios selected to ${WhoIsRegisteringType.SOMEONE_ELSE}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("GET with url Params tests", () => {

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_PAGE_TITLE);
      expect(resp.text).toContain(RADIO_BUTTON_AGENT_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UK_REGULATED_AGENT);
    });

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page with radios selected to ${WhoIsRegisteringType.AGENT}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_AGENT_SELECTED);
    });

    test(`renders the ${config.WHO_IS_MAKING_FILING_PAGE} page with radios selected to ${WhoIsRegisteringType.SOMEONE_ELSE}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test(`redirects to the ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL} page when the ${WhoIsRegisteringType.SOMEONE_ELSE} option is selected and REDIS_flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_DUE_DILIGENCE_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.OVERSEAS_ENTITY_DUE_DILIGENCE_WITH_PARAMS_URL} page and updates the overseas entity when the ${WhoIsRegisteringType.SOMEONE_ELSE} option is selected and REDIS_flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.DUE_DILIGENCE_URL} page when the ${WhoIsRegisteringType.AGENT} option is selected and the REDIS_flag is set to OFF`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.DUE_DILIGENCE_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.DUE_DILIGENCE_WITH_PARAMS_URL} page and updates the overseas-entity when the ${WhoIsRegisteringType.AGENT} option is selected and the REDIS_flag is set to ON`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(NEXT_PAGE_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(2);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_WHO_IS_MAKING_FILING);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.WHO_IS_MAKING_FILING_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST with url params tests", () => {

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(WHO_IS_MAKING_FILING_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_WHO_IS_MAKING_FILING);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.WHO_IS_MAKING_FILING_WITH_PARAMS_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
