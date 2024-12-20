jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock("../../../src/utils/url");

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";

import app from "../../../src/app";

import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasOverseasEntity } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import * as config from "../../../src/config";
import { BeneficialOwnersStatementType } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE } from "../../../src/config";
import { BeneficialOwnerStatementKey } from "../../../src/model/beneficial.owner.statement.model";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { isRegistrationJourney } from "../../../src/utils/url";

import { fetchApplicationData, setApplicationData } from "../../../src/utils/application.data";

import {
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK,
  ERROR
} from "../../__mocks__/session.mock";

import {
  BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING,
  INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER,
  SERVICE_UNAVAILABLE
} from "../../__mocks__/text.mock";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockSetApplicationData = setApplicationData as jest.Mock;

const mockHasOverseasEntity = hasOverseasEntity as jest.Mock;
mockHasOverseasEntity.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(false);

describe("No change Get beneficial owner statement", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {

    test(`that ${UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE} page is rendered`, async() => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BeneficialOwnersStatementType.NONE_IDENTIFIED);
      expect(resp.text).toContain(INFORMATION_SHOWN_ON_THE_PUBLIC_REGISTER);
    });

    test("catch error when rendering the page", async () => {
      mockFetchApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app).get(config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(resp.status).toEqual(500);
    });
  });

  describe("POST tests", () => {

    test(`redirects to ${config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_PAGE} page`, async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app)
        .post(config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_NO_CHANGE_REGISTRABLE_BENEFICIAL_OWNER_URL);
      expect(mockSetApplicationData).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED);
      expect(mockSetApplicationData).not.toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockSetApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app)
        .post(config.UPDATE_NO_CHANGE_BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(resp.status).toEqual(500);
      expect(mockSetApplicationData).toHaveBeenCalled();
    });
  });
});
