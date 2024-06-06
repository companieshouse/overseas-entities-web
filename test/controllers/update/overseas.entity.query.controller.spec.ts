jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock("../../../src/service/company.profile.service");
jest.mock("../../../src/utils/update/company.profile.mapper.to.overseas.entity");
jest.mock("../../../src/utils/update/beneficial_owners_managing_officers_data_fetch");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";

import * as config from "../../../src/config";
import app from "../../../src/app";
import request from "supertest";
import { getApplicationData, setExtraData } from "../../../src/utils/application.data";
import { beforeEach, jest, test, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { ErrorMessages } from "../../../src/validation/error.messages";
import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  OVERSEAS_ENTITY_QUERY_PAGE_TITLE,
  SERVICE_UNAVAILABLE,
} from "../../__mocks__/text.mock";
import { NextFunction } from "express";
import { getCompanyProfile } from "../../../src/service/company.profile.service";
import { mapCompanyProfileToOverseasEntity } from "../../../src/utils/update/company.profile.mapper.to.overseas.entity";
import { companyProfileQueryMock } from "../../__mocks__/update.entity.mocks";
import { retrieveBoAndMoData } from "../../../src/utils/update/beneficial_owners_managing_officers_data_fetch";
import { ApplicationData } from "../../../src/model";

const testOENumber = "OE123456";
const invalidOENUmberError = "OE number must be &quot;OE&quot; followed by 6 digits";
const notFoundOENumberError = "An Overseas Entity with OE number &quot;" + testOENumber + "&quot; was not found";

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockLoggerDebugRequest = logger.debugRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );
const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockMapCompanyProfileToOverseasEntity = mapCompanyProfileToOverseasEntity as jest.Mock;
const mockRetrieveBoAndMoData = retrieveBoAndMoData as jest.Mock;
mockRetrieveBoAndMoData.mockImplementation((req: Request, appData: ApplicationData) => appData.update = { bo_mo_data_fetched: true } );

describe("OVERSEAS ENTITY QUERY controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test(`renders the ${config.OVERSEAS_ENTITY_QUERY_PAGE} page`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_QUERY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_QUERY_PAGE_TITLE);
      expect(resp.text).toContain(config.UPDATE_SERVICE_NAME);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain('href="test"');
    });

    test(`renders the ${config.OVERSEAS_ENTITY_QUERY_PAGE} page for the Remove journey`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ });
      const resp = await request(app).get(`${config.OVERSEAS_ENTITY_QUERY_URL}?${config.JOURNEY_QUERY_PARAM}=remove`);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(OVERSEAS_ENTITY_QUERY_PAGE_TITLE);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(`${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain('href="test"');
    });

    test('catch error when rendering the page', async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app).get(config.OVERSEAS_ENTITY_QUERY_URL);
      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    const invalid_input_values = ['OE123', 'EO123456', 'OE123456789'];

    test.each(invalid_input_values)(
      "given %p, renders OVERSEAS_ENTITY_QUERY_PAGE with validator failure", async (input_value) => {
        const resp = await request(app)
          .post(config.OVERSEAS_ENTITY_QUERY_URL)
          .send({ entity_number: input_value });
        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(invalidOENUmberError);
        expect(resp.text).not.toContain(ErrorMessages.OE_QUERY_NUMBER);
      }
    );

    test('renders the OVERSEAS_ENTITY_QUERY_PAGE page with validator failure for empty oe number', async () => {
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_QUERY_URL)
        .send({ entity_number: '' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(invalidOENUmberError);
      expect(resp.text).toContain(ErrorMessages.OE_QUERY_NUMBER);
      expect(resp.text).toContain(config.UPDATE_SERVICE_NAME);
    });

    test('renders the OVERSEAS_ENTITY_QUERY_PAGE page with validator failure for empty oe number for the Remove journey', async () => {
      const resp = await request(app)
        .post(`${config.OVERSEAS_ENTITY_QUERY_URL}?${config.JOURNEY_QUERY_PARAM}=remove`)
        .send({ entity_number: '' });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(invalidOENUmberError);
      expect(resp.text).toContain(ErrorMessages.OE_QUERY_NUMBER);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(`${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    });

    test('renders not found error for non existing oe number', async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockGetCompanyProfile.mockReturnValueOnce(undefined);
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_QUERY_URL)
        .send({ entity_number: testOENumber });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(notFoundOENumberError);
      expect(resp.text).not.toContain(ErrorMessages.OE_QUERY_NUMBER);
      expect(resp.text).toContain(config.UPDATE_SERVICE_NAME);
    });

    test('renders not found error for non existing oe number for the Remove journey', async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockGetCompanyProfile.mockReturnValueOnce(undefined);
      const resp = await request(app)
        .post(`${config.OVERSEAS_ENTITY_QUERY_URL}?${config.JOURNEY_QUERY_PARAM}=remove`)
        .send({ entity_number: testOENumber });
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(notFoundOENumberError);
      expect(resp.text).not.toContain(ErrorMessages.OE_QUERY_NUMBER);
      expect(resp.text).toContain(config.REMOVE_SERVICE_NAME);
      expect(resp.text).toContain(`${config.UPDATE_INTERRUPT_CARD_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    });

    test('redirects to confirm page for valid oe number in update journey', async () => {
      mockGetApplicationData.mockReturnValue({});
      mockGetCompanyProfile.mockReturnValueOnce(companyProfileQueryMock);
      mockMapCompanyProfileToOverseasEntity.mockReturnValueOnce({});

      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_QUERY_URL)
        .send({ entity_number: 'OE111129' });
      expect(resp.status).toEqual(302);
      expect(mockRetrieveBoAndMoData).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(resp.header.location).toEqual(config.UPDATE_AN_OVERSEAS_ENTITY_URL + config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE);
    });

    test('redirects to confirm page for valid oe number in remove journey', async () => {
      mockGetApplicationData.mockReturnValue({});
      mockGetCompanyProfile.mockReturnValueOnce(companyProfileQueryMock);
      mockMapCompanyProfileToOverseasEntity.mockReturnValueOnce({});

      const resp = await request(app)
        .post(`${config.OVERSEAS_ENTITY_QUERY_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`)
        .send({ entity_number: 'OE111129' });
      expect(resp.status).toEqual(302);
      expect(mockRetrieveBoAndMoData).toHaveBeenCalledTimes(1);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(resp.header.location).toEqual(`${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    });

    test("catch error when posting data", async () => {
      mockLoggerDebugRequest.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
      const resp = await request(app)
        .post(config.OVERSEAS_ENTITY_QUERY_URL)
        .send({ entity_number: testOENumber });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    const values_without_trim = [' OE123456', 'OE123456 ', ' OE123456 '];

    test.each(values_without_trim)(
      "trims the whitespaces and allows user to continue", async (input_value) => {
        const resp = await request(app)
          .post(config.OVERSEAS_ENTITY_QUERY_URL)
          .send({ entity_number: input_value.trim() });
        expect(resp.status).toEqual(200);
        expect(resp.text).not.toContain(invalidOENUmberError);
      });

    test.each(values_without_trim)(
      "trims the whitespaces and allows user to continue when on remove journey", async (input_value) => {
        const resp = await request(app)
          .post(`${config.OVERSEAS_ENTITY_QUERY_URL}?${config.JOURNEY_QUERY_PARAM}=remove`)
          .send({ entity_number: input_value.trim() });
        expect(resp.status).toEqual(200);
        expect(resp.text).not.toContain(invalidOENUmberError);
      });
  });

});
