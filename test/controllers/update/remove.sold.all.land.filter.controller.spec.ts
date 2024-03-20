jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import { ErrorMessages } from '../../../src/validation/error.messages';
import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { REMOVE_SERVICE_NAME } from "../../../src/config";
import { getApplicationData, getRemove, setApplicationData } from "../../../src/utils/application.data";
import { RemoveKey } from "../../../src/model/remove.type.model";
import { HasSoldAllLandKey } from "../../../src/model/data.types.model";

mockRemoveJourneyMiddleware.mockClear();

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockGetRemove = getRemove as jest.Mock;

describe("Remove sold all land filter controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRemove.mockReturnValue({});
  });

  describe("GET tests", () => {
    test(`renders the ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE} page`, async () => {
      const resp = await request(app).get(`${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE} page with data`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [RemoveKey]: { [HasSoldAllLandKey]: config.BUTTON_OPTION_YES } });
      const resp = await request(app).get(`${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("value=\"1\" checked");
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
    });

    test("catch error on current page for GET method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(`${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.REMOVE_SOLD_ALL_LAND_FILTER_URL)
        .send({ has_sold_all_land: config.BUTTON_OPTION_YES });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.header.location).toEqual(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockGetRemove).toHaveBeenCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      const populatedRemoveObject = mockSetApplicationData.mock.calls[0][1];
      expect(populatedRemoveObject[HasSoldAllLandKey]).toEqual(config.BUTTON_OPTION_YES);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(RemoveKey);
    });

    test(`redirects to the ${config.REMOVE_CANNOT_USE_PAGE} page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.REMOVE_SOLD_ALL_LAND_FILTER_URL)
        .send({ has_sold_all_land: config.BUTTON_OPTION_NO });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_CANNOT_USE_URL}?${config.PREVIOUS_PAGE_QUERY_PARAM}=${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
      expect(resp.header.location).toEqual(`${config.REMOVE_CANNOT_USE_URL}?${config.PREVIOUS_PAGE_QUERY_PARAM}=${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockGetRemove).toHaveBeenCalledTimes(1);
      const populatedRemoveObject = mockSetApplicationData.mock.calls[0][1];
      expect(populatedRemoveObject[HasSoldAllLandKey]).toEqual(config.BUTTON_OPTION_NO);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(RemoveKey);
    });

    test("renders the current page with error message and correct page title", async () => {
      const resp = await request(app).post(`${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_REMOVE_SOLD_ALL_LAND_FILTER);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
    });

    test("catch error on current page for POST method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(`${config.REMOVE_SOLD_ALL_LAND_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ has_sold_all_land: config.BUTTON_OPTION_YES });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
