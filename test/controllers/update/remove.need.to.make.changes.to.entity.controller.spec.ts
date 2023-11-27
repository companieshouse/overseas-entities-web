jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  FOUND_REDIRECT_TO,
  PAGE_TITLE_ERROR,
  REMOVE_NEED_MAKE_CHANGES_TITLE,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { REMOVE_SERVICE_NAME } from "../../../src/config";
import { ErrorMessages } from '../../../src/validation/error.messages';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Remove registered owner controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.REMOVE_NEED_MAKE_CHANGES_PAGE} page`, async () => {
      const resp = await request(app).get(`${config.REMOVE_NEED_MAKE_CHANGES_URL}`);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_NEED_MAKE_CHANGES_TITLE);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test("catch error on current page for GET method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(`${config.REMOVE_NEED_MAKE_CHANGES_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.REMOVE_NEED_MAKE_CHANGES_URL} page when yes is selected`, async () => {
      const resp = await request(app)
        .post(`${config.REMOVE_NEED_MAKE_CHANGES_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ make_changes: 'yes' });

      expect(resp.status).toEqual(302);
      // TODO test for the Who is completing this update? page
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.WHO_IS_MAKING_UPDATE_URL}`);
      expect(resp.header.location).toEqual(config.WHO_IS_MAKING_UPDATE_URL);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test(`redirects to the ${config.REMOVE_NEED_MAKE_CHANGES_URL} page when no is selected`, async () => {
      const resp = await request(app)
        .post(`${config.REMOVE_NEED_MAKE_CHANGES_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ make_changes: 'no' });

      expect(resp.status).toEqual(302);
      // TODO test for the Has the overseas entity identified all its registrable beneficial owners?
      expect(resp.text).toEqual(`${FOUND_REDIRECT_TO} ${config.UPDATE_LANDING_URL}`);
      expect(resp.header.location).toEqual(config.UPDATE_LANDING_URL);
      expect(mockLoggerDebugRequest).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message and correct page title", async () => {
      const resp = await request(app).post(`${config.REMOVE_NEED_MAKE_CHANGES_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(REMOVE_NEED_MAKE_CHANGES_TITLE);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.SELECT_REMOVE_NEED_TO_MAKE_CHANGES);
      expect(resp.text).toContain(REMOVE_SERVICE_NAME);
    });

    /* Test cannot be fixed without final navigation in place
    test("catch error on current page for POST method", async () => {
      mockLoggerDebugRequest.mockImplementationOnce(() => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(`${config.REMOVE_NEED_MAKE_CHANGES_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ disposed_all_land: 'yes' });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
    */
  });
});
