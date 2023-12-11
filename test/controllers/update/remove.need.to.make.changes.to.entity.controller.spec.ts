jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/utils/application.data');

import { NextFunction, Request, Response } from "express";
import * as config from "../../../src/config";
import request from "supertest";
import { logger } from "../../../src/utils/logger";
import app from "../../../src/app";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  REMOVE_NEED_MAKE_CHANGES_TITLE,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { REMOVE_SERVICE_NAME } from "../../../src/config";
import { getApplicationData } from "../../../src/utils/application.data";
import { APPLICATION_DATA_CH_REF_UPDATE_MOCK } from "../../__mocks__/session.mock";

const mockGetApplicationData = getApplicationData as jest.Mock;

const mockHasUpdatePresenter = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenter.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;

describe("Remove need to make changes to entity controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.REMOVE_NEED_MAKE_CHANGES_URL} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_CH_REF_UPDATE_MOCK
      });
      const resp = await request(app).get(`${config.REMOVE_NEED_MAKE_CHANGES_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
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
});
