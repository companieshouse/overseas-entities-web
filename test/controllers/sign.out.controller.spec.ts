jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
import { ErrorMessages } from "../../src/validation/error.messages";

jest.mock("ioredis");
jest.mock("../../src/utils/logger");

import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { serviceAvailabilityMiddleware } from "../../src/middleware/service.availability.middleware";
import { NextFunction, Request, Response } from "express";

import * as config from "../../src/config";
import app from "../../src/app";
import {
  ANY_MESSAGE_ERROR,
  PAGE_NOT_FOUND_TEXT,
  SERVICE_UNAVAILABLE, SIGN_OUT_HELP_DETAILS_TEXT,
  SIGN_OUT_HINT_TEXT,
  SIGN_OUT_PAGE_TITLE,
  SIGN_OUT_DROPDOWN_TEXT,
  SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_TEXT,
  SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_DETAILS_TEXT
} from "../__mocks__/text.mock";

import { createAndLogErrorRequest, logger } from '../../src/utils/logger';
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;

const previousPage = `${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`;

describe("Sign Out controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is active, with ${config.MANAGING_OFFICER_CORPORATE_PAGE} as back link`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).toContain(SIGN_OUT_DROPDOWN_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is not active, with ${config.MANAGING_OFFICER_CORPORATE_PAGE} as back link`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain('Your answers will not be saved. You will need to start again if you want to register an overseas entity and tell us about its beneficial owners.');
      expect(resp.text).not.toContain(SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is active, and guidance for resuming a saved journey is displayed`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.SOLD_LAND_FILTER_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).toContain(SIGN_OUT_DROPDOWN_TEXT);
      expect(resp.text).toContain(SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_TEXT);
      expect(resp.text).toContain(SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_DETAILS_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is not active, and guidance for resuming a saved journey is not displayed`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.SOLD_LAND_FILTER_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).not.toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).not.toContain(SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).not.toContain(SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_TEXT);
      expect(resp.text).not.toContain(SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_DETAILS_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
      expect(resp.text).not.toContain('How do I find my saved applications?');
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, with ${config.SOLD_LAND_FILTER_PAGE} as back link`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.SOLD_LAND_FILTER_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(SIGN_OUT_HELP_DETAILS_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, when FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 is active, with ${config.TRUST_INTERRUPT_PAGE} as back link`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.TRUST_INTERRUPT_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.SIGN_OUT_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${config.ACCOUNTS_SIGN_OUT_URL}, the CH search page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.ACCOUNTS_SIGN_OUT_URL);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`redirects to ${config.SOLD_LAND_FILTER_PAGE}, the previous page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.SIGN_OUT_URL)
        .send({ sign_out: 'no', previousPage });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(previousPage);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`should rejecting redirect, throw an error and render not found page`, async () => {
      const mockPreviousPage = "wrong/path";
      const resp = await request(app)
        .post(config.SIGN_OUT_URL)
        .send({ sign_out: 'yes', previousPage: mockPreviousPage });

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
      expect(mockCreateAndLogErrorRequest).toHaveBeenCalledTimes(1);
    });

    test("catch error when posting the page with no selection", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.SIGN_OUT_URL)
      .send({ journey: 'register', saveAndResume: true });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SIGN_OUT);
      expect(resp.text).toContain(SIGN_OUT_SAVE_AND_RESUME_GUIDANCE_TEXT);
      expect(resp.text).toContain('Continue');
    });
  });
});

