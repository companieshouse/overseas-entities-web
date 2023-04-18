jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData } from "../../../src/utils/application.data";
import { CONFIRM_TO_REMOVE_PAGE, CONFIRM_TO_REMOVE_URL } from "../../../src/config";
import { ARE_YOU_SURE_YOU_WANT_TO_REMOVE } from "../../__mocks__/text.mock";
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BO_GOV_ID_URL,
  BO_IND_ID_URL,
  BO_OTHER_ID_URL
} from "../../__mocks__/session.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("CONFIRM TO REMOVE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${CONFIRM_TO_REMOVE_PAGE} page for beneficial owner individual`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(CONFIRM_TO_REMOVE_URL + BO_IND_ID_URL).send({ boName: 'Ivan Drago' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + 'Ivan Drago?');
    });

    test(`renders the ${CONFIRM_TO_REMOVE_PAGE} page for beneficial owner gov`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(CONFIRM_TO_REMOVE_URL + BO_GOV_ID_URL).send({ boName: 'my company name' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + 'my company name?');
    });

    test(`renders the ${CONFIRM_TO_REMOVE_PAGE} page for beneficial owner other`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(CONFIRM_TO_REMOVE_URL + BO_OTHER_ID_URL).send({ boName: 'TestCorporation' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + 'TestCorporation?');
    });
  });
});
