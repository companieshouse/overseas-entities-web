jest.mock('../../../src/utils/feature.flag');
jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock("../../../src/utils/url");

import { ErrorMessages } from "../../../src/validation/error.messages";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { createAndLogErrorRequest, logger } from '../../../src/utils/logger';
import * as config from "../../../src/config";
import app from "../../../src/app";

import {
  ANY_MESSAGE_ERROR,
  PAGE_NOT_FOUND_TEXT,
  SERVICE_UNAVAILABLE,
  UPDATE_SIGN_OUT_HINT_TEXT,
  SIGN_OUT_PAGE_TITLE,
  UPDATE_SIGN_OUT_HELP_DETAILS_TEXT,
  UPDATE_SIGN_OUT_DROPDOWN_TEXT
} from "../../__mocks__/text.mock";

import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getPreviousPageUrl, isRemoveJourney } from "../../../src/utils/url";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
const previousPage = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SECURE_UPDATE_FILTER_PAGE}`;
const mockGetPreviousPageUrl = getPreviousPageUrl as jest.Mock;
const mockIsRemoveJourney = isRemoveJourney as jest.Mock;

describe("SIGN OUT controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPreviousPageUrl.mockReturnValue(previousPage);
    mockIsRemoveJourney.mockReturnValue(false);
  });
  describe("GET tests", () => {
    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME is active,  with ${config.SECURE_UPDATE_FILTER_PAGE} as back link`, async () => {
      mockIsActiveFeature.mockReturnValue(true);
      const resp = await request(app)
        .get(`${config.UPDATE_SIGN_OUT_URL}?page=${config.SECURE_UPDATE_FILTER_PAGE}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(UPDATE_SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(UPDATE_SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).toContain(UPDATE_SIGN_OUT_DROPDOWN_TEXT);
      expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SECURE_UPDATE_FILTER_PAGE}`);
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME is not active,  with ${config.SECURE_UPDATE_FILTER_PAGE} as back link`, async () => {
      mockIsActiveFeature.mockReturnValue(false);
      const resp = await request(app)
        .get(`${config.UPDATE_SIGN_OUT_URL}?page=${config.SECURE_UPDATE_FILTER_PAGE}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain('Your answers will not be saved. You will need to start again if you want to update an overseas entity and tell us about its beneficial owners.');
      expect(resp.text).toContain(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.SECURE_UPDATE_FILTER_PAGE}`);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_SIGN_OUT_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${config.UPDATE_SIGN_OUT_PAGE} page correctly on Remove journey`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME
      mockIsRemoveJourney.mockReturnValue(true);

      const resp = await request(app)
        .get(`${config.UPDATE_SIGN_OUT_URL}?page=${config.SOLD_LAND_FILTER_PAGE}&${config.JOURNEY_QUERY_PARAM}=${config.JourneyType.remove}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(UPDATE_SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(UPDATE_SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).toContain(UPDATE_SIGN_OUT_DROPDOWN_TEXT);
      expect(resp.text).toContain(previousPage);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${config.UPDATE_AN_OVERSEAS_ENTITY_URL}, Signs out of Update journey`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage });
      expect(resp.status).toEqual(302);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`redirects to ${config.SECURE_UPDATE_FILTER_PAGE}, the previous page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_SIGN_OUT_URL)
        .send({ sign_out: 'no', previousPage });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(previousPage);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should reject redirect, throw an error and render not found page`, async () => {
      const mockPreviousPage = "wrong/path";
      const resp = await request(app)
        .post(config.UPDATE_SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage: mockPreviousPage });
      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
    });

    test("catch error when posting the page with no selection", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.UPDATE_SIGN_OUT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SIGN_OUT);
    });
  });
});
