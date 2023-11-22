jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE,
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
    test(`renders the ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE} page`, async () => {
      const resp = await request(app).get(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_IS_ENTITY_REGISTERED_OWNER_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.REMOVE_CANNOT_USE_URL} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ owner_disposed: 'yes' });
      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.REMOVE_CANNOT_USE_URL}`);
      expect(resp.header.location).toEqual(config.REMOVE_CANNOT_USE_URL);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.SECURE_UPDATE_FILTER_URL} page when no is selected`, async () => {
      const resp = await request(app)
        .post(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ owner_disposed: 'no' });
      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.header.location).toEqual(`${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });
  });
});