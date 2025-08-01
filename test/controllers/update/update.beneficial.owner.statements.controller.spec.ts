jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/utils/feature.flag');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";

import { ErrorMessages } from '../../../src/validation/error.messages';
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasOverseasEntity } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import * as config from "../../../src/config";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { TrustKey } from "../../../src/model/trust.model";

import {
  fetchApplicationData,
  setApplicationData
} from "../../../src/utils/application.data";

import {
  BeneficialOwnerStatementKey,
  BeneficialOwnersStatementType,
} from "../../../src/model/beneficial.owner.statement.model";

import {
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL,
} from "../../../src/config";

import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  ERROR
} from '../../__mocks__/session.mock';

import {
  PAGE_TITLE_ERROR,
  BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING,
  SERVICE_UNAVAILABLE,
  SAVE_AND_CONTINUE_BUTTON_TEXT
} from "../../__mocks__/text.mock";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();

const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("BENEFICIAL OWNER STATEMENTS controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test("renders the beneficial owner statements page", async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      // TODO: UAR-369 control
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the beneficial owner statements page with statement validation flag on and trusts flag on ", async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      // TODO: UAR-369 control
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the beneficial owner statements page with statement validation flag on and trusts flag on with no trusts", async () => {
      mockFetchApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK, [TrustKey]: {} });
      mockIsActiveFeature.mockReturnValueOnce(true).mockReturnValueOnce(true);
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      // TODO: UAR-369 control
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("renders the trusts associated page with statement validation flag off and trusts flag on ", async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockIsActiveFeature.mockReturnValueOnce(false).mockReturnValueOnce(true);
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(config.UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
      expect(resp.text).toContain(config.UPDATE_LANDING_PAGE_URL);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      // TODO: UAR-369 control
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockFetchApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app).get(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(resp.status).toEqual(500);
    });
  });

  describe("POST tests", () => {

    test("redirects to the beneficial owner type page", async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app)
        .post(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED);
      expect(mockSetApplicationData).not.toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      const ERROR = new Error("Something went wrong");
      mockFetchApplicationData.mockImplementationOnce(() => { throw ERROR; });

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.text).toContain(SERVICE_UNAVAILABLE); // Check for correct error message
      expect(resp.status).toEqual(500); // Ensure server responds with 500 status
      expect(mockSetApplicationData).not.toHaveBeenCalled(); // Ensure app state wasn't updated
    });

  });
});
