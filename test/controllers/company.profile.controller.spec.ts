jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/service/overseas.entities.service');

import request from "supertest";
import * as config from "../../src/config";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Response, Request } from "express";
import { CHANGE_COMPANY_TEST, CONFIRM_AND_CONTINUE_BUTTON_TEXT, CONFIRM_OVERSEAS_ENTITY_PAGE_TITLE } from "../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";
import { getCompanyRequest } from "../../src/service/overseas.entities.service";
import { getApplicationData } from "../../src/utils/application.data";

const mockGetOeCompanyDetails = getCompanyRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Confirm company data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get company data by Id", () => {

    test("Redirection to What is your OE number page if OE number is undefined", async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.text).toContain(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test("Retrieve company data with OE number", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );

      const resp = await request(app).get(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
      expect(resp.statusCode).toEqual(200);
      expect(resp.text).toContain(CONFIRM_OVERSEAS_ENTITY_PAGE_TITLE);
    });

    test("Return error 500 if companyData mapper returns undefined", async () => {
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
      expect(resp.statusCode).toEqual(500);
    });

    test("confirm and continue button is rendered", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
      expect(resp.statusCode).toEqual(200);
      expect(resp.text).toContain(CONFIRM_AND_CONTINUE_BUTTON_TEXT);
    });

    test("Change company link is rendered", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
      expect(resp.statusCode).toEqual(200);
      expect(resp.text).toContain(CHANGE_COMPANY_TEST);
    });

    test(`redirect to the ${config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );
      const resp = await request(app).post(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
    });
  });
});


