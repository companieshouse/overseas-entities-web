jest.mock("ioredis");
jest.mock('../../src/controllers/authentication.controller');

import { describe, expect, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { authentication } from "../../src/controllers";
import { BENEFICIAL_OWNER_TYPE_URL } from "../../src/config";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const PAGE_HEADING = "Who is a beneficial owner of the overseas entity?";

describe("BENEFICIAL OWNER TYPE controller", () => {
  describe("GET tests", () => {
    test("renders the beneficial owner type page", async () => {
      const resp = await request(app).get(BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_HEADING);
    });
  });

  describe("POST tests", () => {
    test("redirects to the next page", async () => {
      const resp = await request(app).post(BENEFICIAL_OWNER_TYPE_URL).send({});

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual("/next-page");
    });
  });

});
