jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock("../../../src/utils/feature.flag" );

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";
import { JOURNEY_REMOVE_QUERY_PARAM, UPDATE_INTERRUPT_CARD_URL, OVERSEAS_ENTITY_QUERY_URL, UPDATE_ANY_TRUSTS_INVOLVED_URL, SECURE_UPDATE_FILTER_URL } from "../../../src/config";
import { INTERRUPT_CARD_PAGE_TITLE, REMOVE_INTERRUPT_CARD_TEXT, BEFORE_START_PAGE_LINK_AUTHENTICATION, BEFORE_START_PAGE_LINK_VERIFICATION } from "../../__mocks__/text.mock";

import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  PAGE_TITLE_ERROR
} from "../../__mocks__/text.mock";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { logger } from "../../../src/utils/logger";
import { isActiveFeature } from "../../../src/utils/feature.flag";

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("UPDATE INTERRUPT CARD controller", () => {
  describe("GET tests", () => {
    test(`renders the update-interrupt-card page`, async () => {
      const resp = await request(app).get(UPDATE_INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      // back link
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
      expect(resp.text).not.toContain(UPDATE_ANY_TRUSTS_INVOLVED_URL);
      expect(resp.text).not.toContain(REMOVE_INTERRUPT_CARD_TEXT);
      expect(resp.text).not.toContain(BEFORE_START_PAGE_LINK_AUTHENTICATION);
      expect(resp.text).not.toContain(BEFORE_START_PAGE_LINK_VERIFICATION);
    });

    test(`renders the update-interrupt-card page for remove journey`, async () => {
      const resp = await request(app).get(`${UPDATE_INTERRUPT_CARD_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(INTERRUPT_CARD_PAGE_TITLE);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      // back link
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
      expect(resp.text).not.toContain(UPDATE_ANY_TRUSTS_INVOLVED_URL);
      expect(resp.text).toContain(REMOVE_INTERRUPT_CARD_TEXT);
      expect(resp.text).toContain(BEFORE_START_PAGE_LINK_AUTHENTICATION);
      expect(resp.text).toContain(BEFORE_START_PAGE_LINK_VERIFICATION);
    });

    test(`renders the update-interrupt-card page with back link to update-any-trusts-involved if flag off`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app).get(UPDATE_INTERRUPT_CARD_URL);

      expect(resp.status).toEqual(200);
      // back link
      expect(resp.text).toContain(UPDATE_ANY_TRUSTS_INVOLVED_URL);
      expect(resp.text).not.toContain(SECURE_UPDATE_FILTER_URL);
      expect(resp.text).not.toContain(JOURNEY_REMOVE_QUERY_PARAM);
    });

    test(`renders the update-interrupt-card page with correct back link for remove journey`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app).get(`${UPDATE_INTERRUPT_CARD_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      // back link
      expect(resp.text).toContain(`${UPDATE_ANY_TRUSTS_INVOLVED_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.text).not.toContain(SECURE_UPDATE_FILTER_URL);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(UPDATE_INTERRUPT_CARD_URL + config.RELEVANT_PERIOD_QUERY_PARAM);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirect to ${OVERSEAS_ENTITY_QUERY_URL}`, async () => {
      const resp = await request(app).post(UPDATE_INTERRUPT_CARD_URL + config.RELEVANT_PERIOD_QUERY_PARAM);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain("overseas-entity-query");
    });

    test(`redirect to ${OVERSEAS_ENTITY_QUERY_URL}${JOURNEY_REMOVE_QUERY_PARAM} for remove journey`, async () => {
      const resp = await request(app).post(`${UPDATE_INTERRUPT_CARD_URL}${JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(302);
      expect(resp.text).toContain("overseas-entity-query" + JOURNEY_REMOVE_QUERY_PARAM);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(UPDATE_INTERRUPT_CARD_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
