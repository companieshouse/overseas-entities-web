jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');

import { describe, expect, test, beforeEach, jest } from "@jest/globals";

import request from "supertest";
import { NextFunction, Request, Response } from "express";

import app from "../../src/app";
import * as config from "../../src/config";

import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";
import { authentication } from "../../src/middleware/authentication.middleware";
import {
  getApplicationData,
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
  setExtraData
} from "../../src/utils/application.data";
import {
  BeneficialOwnersStatementType,
  BeneficialOwnersStatementTypes,
  BeneficialOwnerStatementKey,
} from "../../src/model/beneficial.owner.statement.model";
import {
  BENEFICIAL_OWNER_DELETE_WARNING_PAGE_HEADING,
  PAGE_TITLE_ERROR,
  SERVICE_UNAVAILABLE,
} from "../__mocks__/text.mock";
import { APPLICATION_DATA_MOCK, ERROR } from "../__mocks__/session.mock";
import { ErrorMessages } from "../../src/validation/error.messages";
import { ManagingOfficerKey } from "../../src/model/managing.officer.model";
import { ManagingOfficerCorporateKey } from "../../src/model/managing.officer.corporate.model";
import { BeneficialOwnerGovKey } from "../../src/model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../../src/model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import { TrustKey } from "../../src/model/trust.model";

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockSetExtraData = setExtraData as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockCheckBOsDetailsEntered = checkBOsDetailsEntered as jest.Mock;
const mockCheckMOsDetailsEntered = checkMOsDetailsEntered as jest.Mock;

const boDeleteWarningURL = `${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?${BeneficialOwnerStatementKey}=`;
const req = {} as Request;

describe("BENEFICIAL OWNER DELETE WARNING controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    BeneficialOwnersStatementTypes.forEach(boStatementType => {
      test(`renders the ${config.BENEFICIAL_OWNER_DELETE_WARNING_PAGE} page if query param value is ${boStatementType}`, async () => {
        const resp = await request(app).get(`${boDeleteWarningURL}${boStatementType}`);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
        expect(resp.text).toContain(config.LANDING_PAGE_URL);
        expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
        expect(resp.text).toContain(BENEFICIAL_OWNER_DELETE_WARNING_PAGE_HEADING);
      });
    });

    test(`throw error and redirect to the service is unavailable page if key of the query param is not correct`, async () => {
      const resp = await request(app).get(`${config.BENEFICIAL_OWNER_DELETE_WARNING_URL}?any=${BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS}`);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`throw error and redirect to the service is unavailable page if value in the query param is not correct`, async () => {
      const resp = await request(app).get(`${boDeleteWarningURL}"=*0"`);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {

    test("redirects to the beneficial owner type page if No option has been selected", async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL)
        .send({ delete_beneficial_owners: "0" });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(mockSetExtraData).not.toHaveBeenCalled();
      expect(mockCheckBOsDetailsEntered).not.toHaveBeenCalled();
      expect(mockCheckMOsDetailsEntered).not.toHaveBeenCalled();
    });

    test(`redirects to the beneficial owner type page if Yes option has been selected and
        ${BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS} as statement type`, async () => {

      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL)
        .send({
          delete_beneficial_owners: "1",
          BeneficialOwnerStatementKey: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS
        });

      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("redirects to the beneficial owner type page after resetting all BOs object", async () => {
      const appData = {
        [BeneficialOwnerIndividualKey]: APPLICATION_DATA_MOCK.beneficial_owners_individual,
        [BeneficialOwnerOtherKey]: APPLICATION_DATA_MOCK.beneficial_owners_corporate,
        [BeneficialOwnerGovKey]: APPLICATION_DATA_MOCK.beneficial_owners_government_or_public_authority,
        [TrustKey]: APPLICATION_DATA_MOCK.trusts,
      };
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockCheckBOsDetailsEntered.mockReturnValueOnce(true);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL)
        .send({
          delete_beneficial_owners: "1",
          [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED
        });

      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toBeCalledWith(req.session, {
        [BeneficialOwnerIndividualKey]: [],
        [BeneficialOwnerOtherKey]: [],
        [BeneficialOwnerGovKey]: [],
        [TrustKey]: [],
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED
      });
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("redirects to the beneficial owner type page after resetting all MOs object", async () => {
      const appData = {
        [ManagingOfficerKey]: APPLICATION_DATA_MOCK.managing_officers_individual,
        [ManagingOfficerCorporateKey]: APPLICATION_DATA_MOCK.managing_officers_corporate
      };
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockCheckMOsDetailsEntered.mockReturnValueOnce(true);

      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL)
        .send({
          delete_beneficial_owners: "1",
          [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS
        });

      expect(resp.status).toEqual(302);
      expect(mockSetExtraData).toBeCalledWith(req.session, {
        [ManagingOfficerKey]: [],
        [ManagingOfficerCorporateKey]: [],
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS
      });
      expect(mockSetExtraData).toHaveBeenCalledTimes(1);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_TYPE_URL);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_DELETE_WARNING_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_IF_YOU_WANT_TO_CHANGE_INFORMATION);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });

    test("catch error when posting data", async () => {
      mockGetApplicationData.mockImplementationOnce(() =>  { throw ERROR; });
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_DELETE_WARNING_URL)
        .send({ delete_beneficial_owners: "1" });

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
