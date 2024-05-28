jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { REMOVE_SERVICE_NAME } from "../../../src/config";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { getApplicationData, getRemove, setApplicationData } from "../../../src/utils/application.data";
import { RemoveKey } from "../../../src/model/remove.type.model";
import { IsListedAsPropertyOwnerKey } from "../../../src/model/data.types.model";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => {
  // Add userEmail to res.locals to make sign-out url appear
  res.locals.userEmail = "userEmail";
  return next();
});
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;
const mockGetRemove = getRemove as jest.Mock;

describe("Remove registered owner controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRemove.mockReturnValue({});
  });

  describe("GET tests", () => {
    test(`renders the ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} page`, async () => {
      const resp = await request(app).get(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}sign-out?page=${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}&amp;${config.JOURNEY_QUERY_PARAM}=${config.JourneyType.remove}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`renders the ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} page with data`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [RemoveKey]: { [IsListedAsPropertyOwnerKey]: config.BUTTON_OPTION_YES } });

      const resp = await request(app).get(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain("value=\"1\" checked");
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
    });

    test("catch error on current page for GET method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.REMOVE_CANNOT_USE_URL} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ is_listed_as_property_owner: config.BUTTON_OPTION_YES });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_CANNOT_USE_URL}?${config.PREVIOUS_PAGE_QUERY_PARAM}=${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);
      expect(resp.header.location).toEqual(`${config.REMOVE_CANNOT_USE_URL}?${config.PREVIOUS_PAGE_QUERY_PARAM}=${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockGetRemove).toHaveBeenCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      const populatedRemoveObject = mockSetApplicationData.mock.calls[0][1];
      expect(populatedRemoveObject[IsListedAsPropertyOwnerKey]).toEqual(config.BUTTON_OPTION_YES);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(RemoveKey);
    });

    test(`redirects to the ${config.SECURE_UPDATE_FILTER_URL} page when no is selected`, async () => {
      const resp = await request(app)
        .post(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ is_listed_as_property_owner: config.BUTTON_OPTION_NO });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.header.location).toEqual(`${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockGetApplicationData).toHaveBeenCalledTimes(1);
      expect(mockGetRemove).toHaveBeenCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
      const populatedRemoveObject = mockSetApplicationData.mock.calls[0][1];
      expect(populatedRemoveObject[IsListedAsPropertyOwnerKey]).toEqual(config.BUTTON_OPTION_NO);
      expect(mockSetApplicationData.mock.calls[0][2]).toEqual(RemoveKey);
    });

    test("renders the current page with error message and correct page title", async () => {
      const resp = await request(app).post(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ENTITY_IS_ON_REGISTRY);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}sign-out?page=${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}&amp;${config.JOURNEY_QUERY_PARAM}=${config.JourneyType.remove}`);
    });

    test("catch error on current page for POST method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ is_listed_as_property_owner: config.BUTTON_OPTION_NO });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
