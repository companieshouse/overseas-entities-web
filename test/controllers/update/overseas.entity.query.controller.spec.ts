jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../../src/config";
import app from "../../../src/app";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
  OVERSEAS_ENTITY_QUERY_PAGE_TITLE
} from "../../__mocks__/text.mock";

import { deleteApplicationData, getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { logger } from "../../../src/utils/logger";
import { ErrorMessages } from "../../../src/validation/error.messages";

const mockDeleteApplicationData = deleteApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;

describe("OVERSEAS ENTITY QUERY controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.OVERSEAS_ENTITY_QUERY_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_QUERY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_QUERY_PAGE_TITLE);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(mockDeleteApplicationData).toBeCalledTimes(0);
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_QUERY_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test('renders the CONFIRM_OVERSEAS_COMPANY_PROFILES page when valid oeNumber submitted', async () => {
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_QUERY_URL)
        .send({ oe_number: '12345678' });
      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
    });

    test('renders the OVERSEAS_ENTITY_QUERY_PAGE page with error messages', async () => {
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_QUERY_URL)
        .send({ oe_number: '' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.OE_QUERY_NAME);
      expect(resp.text).toContain(ErrorMessages.MAX_OE_LENGTH);
    });
  });
});
