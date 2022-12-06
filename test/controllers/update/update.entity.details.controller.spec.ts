jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/service/overseas.entities.service');

import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { NextFunction, Response, Request } from "express";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE } from "../../__mocks__/text.mock";
import { logger } from "../../../src/utils/logger";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Confirm company data", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Test update overseas entity details page", () => {

    test('Render update page', async () => {
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTRY_DETAILS_URL)
      expect(resp.statusCode).toEqual(200);
      console.log(resp.text)
    })
  })
});