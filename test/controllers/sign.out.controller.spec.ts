jest.mock("ioredis");
jest.mock("../../src/utils/logger");

import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import {
  ANY_MESSAGE_ERROR,
  SERVICE_UNAVAILABLE,
  SIGN_OUT_HINT_TEXT,
  SIGN_OUT_PAGE_TITLE
} from "../__mocks__/text.mock";

import { logger } from "../../src/utils/logger";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Sign Out controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.SIGN_OUT_PAGE} page, with ${config.MANAGING_OFFICER_CORPORATE_PAGE} as back link`, async () => {
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
    });

    test(`renders the ${config.SIGN_OUT_PAGE} page, with ${config.SOLD_LAND_FILTER_PAGE} as back link`, async () => {
      const resp = await request(app)
        .get(`${config.SIGN_OUT_URL}?page=${config.SOLD_LAND_FILTER_PAGE}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SIGN_OUT_PAGE_TITLE);
      expect(resp.text).toContain(SIGN_OUT_HINT_TEXT);
      expect(resp.text).toContain(`${config.REGISTER_AN_OVERSEAS_ENTITY_URL}${config.SOLD_LAND_FILTER_PAGE}`);
    });

    test("catch error when rendering the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.SIGN_OUT_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${config.ACCOUNTS_SIGNOUT_URL}, the CH search page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SIGN_OUT_URL)
        .send({ sign_out: 'yes' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.ACCOUNTS_SIGNOUT_URL);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to ${config.SOLD_LAND_FILTER_PAGE}, the previus page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.SIGN_OUT_URL)
        .send({ sign_out: 'no', previous_page: config.SOLD_LAND_FILTER_PAGE });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.SOLD_LAND_FILTER_PAGE);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test("catch error when posting the page", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.SIGN_OUT_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
