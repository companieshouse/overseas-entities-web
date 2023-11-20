jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE,
} from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { REMOVE_SERVICE_NAME } from "../../../src/config";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Remove sold all land filter controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE} page`, async () => {
      const resp = await request(app).get(config.REMOVE_SOLD_ALL_LAND_FILTER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_SOLD_ALL_LAND_FILTER_PAGE_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(config.REMOVE_SOLD_ALL_LAND_FILTER_URL)
        .send({ disposed_all_land: 'yes' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);
      expect(resp.header.location).toEqual(config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.REMOVE_UNALLOWED} page when no is selected`, async () => {
      const resp = await request(app)
        .post(config.REMOVE_SOLD_ALL_LAND_FILTER_URL)
        .send({ disposed_all_land: 'no' });

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_UNALLOWED}`);
      expect(resp.header.location).toEqual(config.REMOVE_UNALLOWED);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });
  });
});
