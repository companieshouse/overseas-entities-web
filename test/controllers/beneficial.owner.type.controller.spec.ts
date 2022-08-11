jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/application.data');
jest.mock('../../src/middleware/navigation/has.beneficial.owners.statement.middleware');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../src/app";
import { authentication } from "../../src/middleware/authentication.middleware";
import * as config from "../../src/config";
import { getApplicationData } from '../../src/utils/application.data';
import {
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING,
  CHECK_YOUR_ANSWERS_LINK,
  SERVICE_UNAVAILABLE,
  TRUST_INFORMATION_LINK,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_ALL_IDENTIFIED_ALL_DETAILS,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_SOME_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_SOME_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO
} from '../__mocks__/text.mock';
import { APPLICATION_DATA_MOCK, APPLICATION_DATA_NO_TRUSTS_MOCK, ERROR } from '../__mocks__/session.mock';
import {
  BeneficialOwnerTypeChoice,
  BeneficialOwnerTypeKey,
  ManagingOfficerTypeChoice,
} from "../../src/model/beneficial.owner.type.model";
import { ErrorMessages } from '../../src/validation/error.messages';
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from '../../src/model/beneficial.owner.statement.model';
import { hasBeneficialOwnersStatement } from "../../src/middleware/navigation/has.beneficial.owners.statement.middleware";

const mockHasBeneficialOwnersStatementMiddleware = hasBeneficialOwnersStatement as jest.Mock;
mockHasBeneficialOwnersStatementMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("BENEFICIAL OWNER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test("renders the beneficial owner type page for beneficial owners with trusts", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL); // back button
      expect(resp.text).not.toContain(CHECK_YOUR_ANSWERS_LINK); // continue button
      expect(resp.text).toContain(TRUST_INFORMATION_LINK); // continue button
    });

    test("renders the beneficial owner type page for beneficial owners without trusts", async () => {
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_NO_TRUSTS_MOCK);
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL); // back button
      expect(resp.text).toContain(CHECK_YOUR_ANSWERS_LINK); // continue button
      expect(resp.text).not.toContain(TRUST_INFORMATION_LINK); // continue button
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT);
    });

    test("renders the beneficial owner type page for beneficial owners", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS
      });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
    });

    test("renders the beneficial owner type page for managing officers", async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED
      });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(config.LANDING_PAGE_URL);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
    });

    test("renders the beneficial owner type page for beneficial owners with just the BOs options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED);
    });

    test("renders the beneficial owner type page for beneficial owners with just the MOs options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED);
    });

    test("renders the beneficial owner type page for beneficial owners with both options", async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_SOME_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_SOME_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_SOME_IDENTIFIED);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_INDIVIDUAL_URL);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.otherLegal });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_OTHER_URL);
    });

    test(`redirects to the ${config.BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.government });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.BENEFICIAL_OWNER_GOV_URL);
    });

    test(`redirects to the ${config.MANAGING_OFFICER_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.MANAGING_OFFICER_URL);
    });

    test(`redirects to the ${config.MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.corporate });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.MANAGING_OFFICER_CORPORATE_URL);
    });

    test("renders the current page with error message", async () => {
      const resp = await request(app).post(config.BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      expect(resp.text).toContain(config.BENEFICIAL_OWNER_STATEMENTS_URL);
    });
  });
});
