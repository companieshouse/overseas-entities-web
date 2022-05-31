import { ErrorMessages } from "../../src/validation/error.messages";

jest.mock('../../src/middleware/authentication.middleware');

import request from "supertest";
import app from "../../src/app";
import * as config from "../../src/config";
import { beforeEach, expect, jest, test } from "@jest/globals";
import { SECURE_REGISTER_FILTER_PAGE_HEADING } from "../__mocks__/text.mock";
import { SECURE_REGISTER_FILTER_URL } from "../../src/config";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Request, Response } from "express";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe( "SECURE REGISTER FILTER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the the ${config.SECURE_REGISTER_FILTER_PAGE} page`, async () => {
      const resp = await request(app).get(SECURE_REGISTER_FILTER_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(config.LANDING_URL);
    });
  });

  describe("POST tests", () => {
    test(`renders the ${config.USE_PAPER_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ secure_register: '1' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("You cannot use this service");
    });

    test("redirect to interrupt card page if user selects no", async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL)
        .send({ secure_register: '0' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.INTERRUPT_CARD_URL);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app)
        .post(config.SECURE_REGISTER_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(SECURE_REGISTER_FILTER_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_SECURE_REGISTER_FILTER);
    });
  });
});
