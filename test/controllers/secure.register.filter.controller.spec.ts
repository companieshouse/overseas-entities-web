jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../src/app";
import * as config from "../../src/config";
import { ErrorMessages } from "../../src/validation/error.messages";
import {
  ANY_MESSAGE_ERROR,
  RADIO_BUTTON_NO_SELECTED,
  RADIO_BUTTON_YES_SELECTED,
  SECURE_REGISTER_FILTER_PAGE_HEADING,
  SERVICE_UNAVAILABLE,
} from "../__mocks__/text.mock";
import { SECURE_REGISTER_FILTER_URL } from "../../src/config";

import { getApplicationData, setExtraData } from "../../src/utils/application.data";
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from "../../src/utils/logger";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;

describe( "SECURE REGISTER FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the the ${config.SECURE_REGISTER_FILTER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(config.LANDING_URL);
      expect(resp.text).not.toContain(RADIO_BUTTON_YES_SELECTED);
      expect(resp.text).not.toContain(RADIO_BUTTON_NO_SELECTED);
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
    test(`renders the ${config.USE_PAPER_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ is_secure_register: '1' });
      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("redirect to interrupt card page if user selects no", async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ is_secure_register: '0' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.INTERRUPT_CARD_URL);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SECURE_REGISTER_FILTER);
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
