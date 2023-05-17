jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/save.and.continue');

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import request from "supertest";
import app from "../../../src/app";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { NextFunction } from "express";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_UPDATE_BO_MOCK, UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST } from "../../__mocks__/session.mock";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE } from '../../__mocks__/text.mock';
import { UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE } from '../../../src/config';

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
describe('Test review managing officer', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {

    test(`render the ${UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
      });
      const resp = await request(app).get(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);
      // console.log(`resp data is ${resp.text}`)
      expect(resp.status).toEqual(200);
      console.log(resp.text);
    });
  });

  test("catch error when rendering the page", async () => {
    mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    const resp = await request(app).get(UPDATE_REVIEW_INDIVIDUAL_MANAGING_OFFICER_WITH_PARAM_URL_TEST);

    expect(resp.status).toEqual(500);
    expect(resp.text).toContain(SERVICE_UNAVAILABLE);
  });
});
