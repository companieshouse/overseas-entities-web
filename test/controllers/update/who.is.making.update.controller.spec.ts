jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/service/transaction.service');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock("../../../src/utils/url");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";

import { ErrorMessages } from '../../../src/validation/error.messages';
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { isRegistrationJourney } from "../../../src/utils/url";

import { WhoIsRegisteringKey, WhoIsRegisteringType } from "../../../src/model/who.is.making.filing.model";
import { setExtraData, fetchApplicationData } from "../../../src/utils/application.data";

import {
  WHO_IS_MAKING_UPDATE_PAGE,
  WHO_IS_MAKING_UPDATE_URL,
  UPDATE_DUE_DILIGENCE_PAGE,
  UPDATE_DUE_DILIGENCE_URL,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE,
  UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL
} from "../../../src/config";

import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  RADIO_BUTTON_AGENT_SELECTED,
  RADIO_BUTTON_SOMEONE_ELSE_SELECTED,
  SERVICE_UNAVAILABLE,
  UK_REGULATED_AGENT,
  WHO_IS_MAKING_UPDATE_PAGE_TITLE,
} from "../../__mocks__/text.mock";

mockJourneyDetectionMiddleware.mockClear();
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

const mockSetExtraData = setExtraData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(false);

describe("Who is making update controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe("GET tests", () => {
    test(`renders the ${WHO_IS_MAKING_UPDATE_PAGE} page`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(WHO_IS_MAKING_UPDATE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(WHO_IS_MAKING_UPDATE_PAGE_TITLE);
      expect(resp.text).not.toContain(RADIO_BUTTON_AGENT_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(UK_REGULATED_AGENT);
    });

    test(`renders the ${WHO_IS_MAKING_UPDATE_PAGE} page with radios selected to ${WhoIsRegisteringType.AGENT}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });
      const resp = await request(app).get(WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_AGENT_SELECTED);
    });

    test(`renders the ${WHO_IS_MAKING_UPDATE_PAGE} page with radios selected to ${WhoIsRegisteringType.SOMEONE_ELSE}`, async () => {
      mockFetchApplicationData.mockReturnValueOnce({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });
      const resp = await request(app).get(WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RADIO_BUTTON_SOMEONE_ELSE_SELECTED);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(WHO_IS_MAKING_UPDATE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${UPDATE_DUE_DILIGENCE_PAGE} page when ${WhoIsRegisteringType.AGENT} is selected and REDIS_flag is set to OFF`, async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(WHO_IS_MAKING_UPDATE_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_DUE_DILIGENCE_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirect to ${UPDATE_DUE_DILIGENCE_PAGE} page when ${WhoIsRegisteringType.AGENT} is selected and REDIS_flag is set to ON`, async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockUpdateOverseasEntity.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(WHO_IS_MAKING_UPDATE_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_DUE_DILIGENCE_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page when ${WhoIsRegisteringType.SOMEONE_ELSE} is selected and REDIS_flag is set to OFF`, async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(WHO_IS_MAKING_UPDATE_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_PAGE} page when ${WhoIsRegisteringType.SOMEONE_ELSE} is selected and REDIS_flag is set to ON`, async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockUpdateOverseasEntity.mockReturnValueOnce(false);
      const resp = await request(app)
        .post(WHO_IS_MAKING_UPDATE_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.SOMEONE_ELSE });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_DUE_DILIGENCE_OVERSEAS_ENTITY_URL);
      expect(mockIsActiveFeature).toHaveBeenCalledTimes(1);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("POST empty object and check for error in page title", async () => {
      const resp = await request(app).post(WHO_IS_MAKING_UPDATE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(WHO_IS_MAKING_UPDATE_PAGE_TITLE);
      expect(resp.text).toContain(ErrorMessages.SELECT_WHO_IS_MAKING_UPDATE_FILING);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(WHO_IS_MAKING_UPDATE_URL)
        .send({ [WhoIsRegisteringKey]: WhoIsRegisteringType.AGENT });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
