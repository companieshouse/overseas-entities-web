jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/utils/save.and.continue");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.given.valid.bo.mo.details.middleware');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { getApplicationData, removeFromApplicationData, findBoOrMo } from "../../../src/utils/application.data";
import {
  UPDATE_CONFIRM_TO_REMOVE_PAGE,
  UPDATE_CONFIRM_TO_REMOVE_URL,
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_OTHER,
  UPDATE_BENEFICIAL_OWNER_TYPE_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  PARAM_MANAGING_OFFICER_INDIVIDUAL,
  PARAM_MANAGING_OFFICER_CORPORATE
} from "../../../src/config";
import { ARE_YOU_SURE_YOU_WANT_TO_REMOVE, SERVICE_UNAVAILABLE } from "../../__mocks__/text.mock";
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BO_IND_ID_URL,
  BO_GOV_ID_URL,
  BO_OTHER_ID_URL,
  ERROR,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  UPDATE_MANAGING_OFFICER_OBJECT_MOCK,
  MO_IND_ID_URL,
  MO_CORP_ID_URL
} from "../../__mocks__/session.mock";
import { hasGivenValidBoMoDetails } from "../../../src/middleware/navigation/update/has.given.valid.bo.mo.details.middleware";

mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasGivenValidBoMoDetailsMiddleware = hasGivenValidBoMoDetails as jest.Mock;
mockHasGivenValidBoMoDetailsMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockRemoveFromApplicationData = removeFromApplicationData as jest.Mock;
const mockFindBoOrMo = findBoOrMo as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue({ ...APPLICATION_DATA_UPDATE_BO_MOCK });

describe("CONFIRM TO REMOVE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${UPDATE_CONFIRM_TO_REMOVE_PAGE} page for beneficial owner individual`, async () => {
      mockFindBoOrMo.mockImplementationOnce( () => { return UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK; });
      const resp = await request(app).get(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_INDIVIDUAL + BO_IND_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + ' Ivan Drago?');
    });

    test(`renders the ${UPDATE_CONFIRM_TO_REMOVE_PAGE} page for beneficial owner gov`, async () => {
      mockFindBoOrMo.mockImplementationOnce( () => { return UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK; });
      const resp = await request(app).get(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_GOV + BO_GOV_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + ' my company name?');
    });

    test(`renders the ${UPDATE_CONFIRM_TO_REMOVE_PAGE} page for beneficial owner other`, async () => {
      mockFindBoOrMo.mockImplementationOnce( () => { return UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK; });
      const resp = await request(app).get(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_OTHER + BO_OTHER_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + ' TestCorporation?');
    });

    test(`renders the ${UPDATE_CONFIRM_TO_REMOVE_PAGE} page for managing officer individual`, async () => {
      mockFindBoOrMo.mockImplementationOnce( () => { return UPDATE_MANAGING_OFFICER_OBJECT_MOCK; });
      const resp = await request(app).get(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_MANAGING_OFFICER_INDIVIDUAL + MO_IND_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + ' Joe Bloggs?');
    });

    test(`renders the ${UPDATE_CONFIRM_TO_REMOVE_PAGE} page for managing officer corporate`, async () => {
      mockFindBoOrMo.mockImplementationOnce( () => { return UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK; });
      const resp = await request(app).get(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_MANAGING_OFFICER_CORPORATE + MO_CORP_ID_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + ' Joe Bloggs Ltd?');
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_OTHER + BO_OTHER_ID_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page if user selects no`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_INDIVIDUAL + BO_IND_ID_URL)
        .send({ do_you_want_to_remove: '0' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockRemoveFromApplicationData).not.toHaveBeenCalled();
    });

    test(`BO individual removed and redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_INDIVIDUAL + BO_IND_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`BO gov removed and redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_GOV + BO_GOV_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`BO other removed and redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_OTHER + BO_OTHER_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`MO individual removed and redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_MANAGING_OFFICER_INDIVIDUAL + MO_IND_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`MO corporate removed and redirects to ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page if user selects yes`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_MANAGING_OFFICER_CORPORATE + MO_CORP_ID_URL)
        .send({ do_you_want_to_remove: '1' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockRemoveFromApplicationData).toHaveBeenCalledTimes(1);
    });

    test(`Re-renders ${UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page with error if user makes no selection`, async () => {
      const resp = await request(app)
        .post(UPDATE_CONFIRM_TO_REMOVE_URL + "/" + PARAM_BENEFICIAL_OWNER_OTHER + BO_OTHER_ID_URL)
        .send({ boMoName: 'TestCorporation' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ARE_YOU_SURE_YOU_WANT_TO_REMOVE + ' TestCorporation?');
      expect(resp.text).toContain("Are you sure you want to remove TestCorporation?");
      expect(mockRemoveFromApplicationData).not.toHaveBeenCalled();
    });
  });
});
