jest.mock("ioredis");
jest.mock("../../src/utils/logger");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
import request from "supertest";
import * as config from "../../src/config";
import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import { NextFunction, Response, Request } from "express";
import { getApplicationData } from "../../src/utils/application.data";
import { CONFIRM_OVERSEAS_ENTITY_PAGE_TITLE } from "../__mocks__/text.mock";
import { createOAuthApiClient } from "../../src/service/api.service";
import { getSessionRequestWithPermission } from "../__mocks__/session.mock";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockGetApplicationData = getApplicationData as jest.Mock;
describe("Confirm company data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get company data by Id", () => {
    test("Retrieve company data", async () => {
      const apiClientResponse = createOAuthApiClient(getSessionRequestWithPermission());
      const resp = (await apiClientResponse.companyProfile.getCompanyProfile("NI038379")).resource;
      mockGetApplicationData.mockReturnValueOnce({ });
      expect(resp?.companyName).toEqual("THE POLISH BREWERY");
      expect(resp?.companyNumber).toEqual("NI038379");
      expect(resp?.registeredOfficeAddress.locality).toEqual("POLAND");
    });

    test(`renders the ${config.CONFIRM_OVERSEA_ENTITY_DETAILS_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL + "/NI038379");
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(CONFIRM_OVERSEAS_ENTITY_PAGE_TITLE);
    });
  });
});


