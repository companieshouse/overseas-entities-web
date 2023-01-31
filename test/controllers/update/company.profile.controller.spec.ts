jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/service.availability.middleware');

import { beforeEach, jest, describe } from "@jest/globals";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData } from "../../../src/utils/application.data";
import request from "supertest";
import { NextFunction } from "express";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../../__mocks__/text.mock";

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );


describe("Confirm company data", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get confirm company profile", () => {
    test(`renders the ${config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL} page`, async () => {
      const testDateOfCreation = "1/1/2023";
      const testEntityName = "testEntity";
      mockGetApplicationData.mockReturnValueOnce({
        entity_name: testEntityName,
        entity_number: "OE111129",
        entity: {
          principal_address: {
            property_name_number: "123456",
            line_1: "abcxyz",
            country: "UK"
          }
        },
        update: {
          date_of_creation: testDateOfCreation
        }
      });
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(testEntityName);
      expect(resp.text).toContain(testDateOfCreation);
      expect(resp.text).toContain("123456 abcxyz UK");
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("Post confirm company profile", () => {
    test(`redirects`, async () => {
      mockGetApplicationData.mockReturnValueOnce({});

      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_REVIEW_PAGE);
    });

    test('catch error when posting to the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL).send({});
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
