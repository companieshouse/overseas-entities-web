jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/service.availability.middleware');

import { NextFunction, Response, Request } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import * as config from "../../../src/config";
import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { ANY_MESSAGE_ERROR, CHANGE_COMPANY_TEST, CONFIRM_AND_CONTINUE_BUTTON_TEXT, SERVICE_UNAVAILABLE } from "../../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { getCompanyRequest } from "../../../src/service/overseas.entities.service";
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { logger } from "../../../src/utils/logger";
import { OeErrorKey } from "../../../src/model/data.types.model";

const mockGetOeCompanyDetails = getCompanyRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const req = {} as Request;

describe("Confirm company data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Get company data by Id", () => {

    test("Redirection to What is your OE number page if OE number is undefined", async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
      expect(resp.text).toContain(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test("OE error key is set when OE data does not exist", async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.statusCode).toEqual(302);
      expect(mockSetExtraData).toBeCalledWith(req.session, {
        [OeErrorKey]: "The Overseas Entity with OE number  is not valid or does not exist."
      });
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(resp.header.location).toEqual(config.OVERSEAS_ENTITY_QUERY_URL);
    });

    test("confirm and continue button is rendered", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( { oe_number: '12345678' } );

      const resp = await request(app).get(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.statusCode).toEqual(200);
      expect(resp.text).toContain(CONFIRM_AND_CONTINUE_BUTTON_TEXT);
    });

    test("Change company link is rendered", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.statusCode).toEqual(200);
      expect(resp.text).toContain(CHANGE_COMPANY_TEST);
    });

    test(`redirect to the ${config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );
      const resp = await request(app).post(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.statusCode).toEqual(302);
      expect(resp.redirect).toEqual(true);
    });

    test(`OE number is retrieved from session data`, async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockGetOeCompanyDetails.mockReturnValue( APPLICATION_DATA_MOCK );
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.statusCode).toEqual(200);
      expect(mockGetOeCompanyDetails).toHaveBeenCalled();
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test('catch error when redirecting on post save and confirm', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).post(config.CONFIRM_OVERSEAS_ENTITY_PROFILES_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
