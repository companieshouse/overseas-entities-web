jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.overseas.entity.middleware');

import { NextFunction, Request, Response } from "express";
import { beforeEach, expect, jest, test, describe } from "@jest/globals";
import request from "supertest";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import * as config from "../../../src/config";
import app from "../../../src/app";
import { APPLICATION_DATA_MOCK, BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK, ERROR } from "../../__mocks__/session.mock";
import { checkBOsDetailsEntered, checkMOsDetailsEntered, getApplicationData } from "../../../src/utils/application.data";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import {
  BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE

}
  from "../../__mocks__/text.mock";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { hasOverseasEntityNumber } from "../../../src/middleware/navigation/update/has.overseas.entity.middleware";
import { BeneficialOwnerStatementKey, BeneficialOwnersStatementType } from "../../../src/model/beneficial.owner.statement.model";
import { saveAndContinue } from "../../../src/utils/save.and.continue";

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasOverseasEntityNumber = hasOverseasEntityNumber as jest.Mock;
mockHasOverseasEntityNumber.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;
const redirectUrl = `${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?${BeneficialOwnerStatementKey}=`;
const mockCheckMOsDetailsEntered = checkMOsDetailsEntered as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockCheckBOsDetailsEntered = checkBOsDetailsEntered as jest.Mock;

describe("OVERSEAS ENTITY UPDATE DETAILS controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    // test(`renders the OVERSEAS ENTITY UPDATE DETAILS page`, async () => {
    //   mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK });
    //   const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    //   expect(resp.status).toEqual(200);
    //   expect(resp.text).toContain(config.ENTITY_URL);
    //   expect(resp.text).toContain("Has the overseas entity identified any registrable beneficial owners?");
    //   expect(resp.text).toContain("All beneficial owners have been identified and I can provide all the required information");
    // });

    // test("catch error when rendering the page", async () => {
    //   mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
    //   const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);

    //   expect(resp.status).toEqual(500);
    //   expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    // });
  });
  describe("POST tests", () => {
    test("redirects to the beneficial owner type page", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_STATEMENTS_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_ANY_BENEFICIAL_OWNERS_BEEN_IDENTIFIED);
      expect(resp.text).toContain(config.ENTITY_URL);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: BENEFICIAL_OWNER_STATEMENT_OBJECT_MOCK });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`redirects to ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}
              page with NONE_IDENTIFIED as beneficial owners statement type`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
      });
      mockCheckBOsDetailsEntered.mockReturnValueOnce(true);

      const boStatement = BeneficialOwnersStatementType.NONE_IDENTIFIED;
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: boStatement });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${redirectUrl}${boStatement}`);
    });

    test(`redirects to ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE}
              page with ALL_IDENTIFIED_ALL_DETAILS as beneficial owners statement type`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
      });
      mockCheckMOsDetailsEntered.mockReturnValueOnce(true);

      const boStatement = BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS;
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_STATEMENTS_URL)
        .send({ [BeneficialOwnerStatementKey]: boStatement });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(`${redirectUrl}${boStatement}`);
    });
  });
});
