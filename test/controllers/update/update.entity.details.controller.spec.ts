jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/service/overseas.entities.service');

import request from "supertest";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { NextFunction, Response, Request } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import { UPDATE_OVERSEAS_ENTITY_TITLE } from "../../__mocks__/text.mock";
import { ERROR } from "../../__mocks__/session.mock";
import { getApplicationData } from "../../../src/utils/application.data";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockGetApplicationData = getApplicationData as jest.Mock;

describe("Confirm company data", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Test update overseas entity details page", () => {

    test('Render update page', async () => {
      const resp = await request(app).get(config.UPDATE_OVERSEAS_ENTITY_DETAILS_URL);
      expect(resp.statusCode).toEqual(200);
      expect(resp.text).toContain(UPDATE_OVERSEAS_ENTITY_TITLE);
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementationOnce(() =>  { throw ERROR; });
      const resp = await request(app)
        .post(config.UPDATE_OVERSEAS_ENTITY_DETAILS_URL);
      expect(resp.status).toEqual(404);
    });
  });
});
