jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
// jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.sold.land.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import * as config from "../../src/config";
import app from "../../src/app";
import { CANNOT_USE_SERVICE_HEADING } from "../__mocks__/text.mock";

import { authentication } from "../../src/middleware/authentication.middleware";
import { hasSoldLand } from "../../src/middleware/navigation/has.sold.land.middleware";
// import { getApplicationData } from "../../src/utils/application.data";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

// const mockGetApplicationData = getApplicationData as jest.Mock;
const mockHasSoldLandMiddleware = hasSoldLand as jest.Mock;
mockHasSoldLandMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("USE PAPER controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.USE_PAPER_PAGE} page`, async () => {
      const resp = await request(app).get(config.USE_PAPER_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
    });

    // test(`redirect to the ${config.SOLD_LAND_FILTER_PAGE} page`, async () => {
    //   mockHasSoldLandMiddleware.mockImplementation( () => hasSoldLand );
    //   mockGetApplicationData.mockReturnValue({ has_sold_land: '1' });

    //   const resp = await request(app).get(config.USE_PAPER_URL);

    //   expect(resp.status).toEqual(302);
    //   // expect(resp.text).toContain(CANNOT_USE_SERVICE_HEADING);
    // });
  });
});
