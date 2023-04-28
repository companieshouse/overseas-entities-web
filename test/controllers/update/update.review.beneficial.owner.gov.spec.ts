jest.mock("ioredis");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import * as config from "../../../src/config";
import { getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_MOCK, UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST } from "../../__mocks__/session.mock";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import request from "supertest";
import app from "../../../src/app";
import { UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING } from "../../__mocks__/text.mock";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { NextFunction } from "express";

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());
const mockGetApplicationData = getApplicationData as jest.Mock;

describe(`Update review beneficial owner Gov`, () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe(`GET tests`, () => {
    test(`render the ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({...APPLICATION_DATA_MOCK});
      const resp = await request(app).get(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_URL_WITH_PARAM_URL_TEST);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_URL);
    })
  })
})