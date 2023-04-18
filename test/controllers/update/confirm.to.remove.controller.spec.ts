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
import { getApplicationData, removeFromApplicationData } from "../../../src/utils/application.data";
import { CONFIRM_TO_REMOVE_PAGE, CONFIRM_TO_REMOVE_URL, PARAM_BENEFICIAL_OWNER_GOV, PARAM_BENEFICIAL_OWNER_INDIVIDUAL, PARAM_BENEFICIAL_OWNER_OTHER, UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE } from "../../../src/config";
import { ARE_YOU_SURE_YOU_WANT_TO_REMOVE } from "../../__mocks__/text.mock";
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BO_IND_ID_URL,
  BO_GOV_ID_URL,
  BO_OTHER_ID_URL
} from "../../__mocks__/session.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockRemoveFromApplicationData = removeFromApplicationData as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("CONFIRM TO REMOVE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${CONFIRM_TO_REMOVE_PAGE} page for beneficial owner individual`, async () => {
      mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_INDIVIDUAL + BO_IND_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + 'Ivan Drago?');
    });

    test(`renders the ${CONFIRM_TO_REMOVE_PAGE} page for beneficial owner gov`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_GOV + BO_GOV_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + 'my company name?');
    });

    test(`renders the ${CONFIRM_TO_REMOVE_PAGE} page for beneficial owner other`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_OTHER + BO_OTHER_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + 'TestCorporation?');
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page if user selects no`, async () => {
      const resp = await request(app)
        .post(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_INDIVIDUAL + BO_IND_ID_URL)
        .send({ do_you_want_to_remove: '0' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE);
      expect(mockRemoveFromApplicationData).not.toHaveBeenCalled();
    });

    test(`BO individual removed and redirects to ${UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_INDIVIDUAL + BO_IND_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`BO gov removed and redirects to ${UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_GOV + BO_GOV_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`BO other removed and redirects to ${UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_OTHER + BO_OTHER_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });
  });
});
