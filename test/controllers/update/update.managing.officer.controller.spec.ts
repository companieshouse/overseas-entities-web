jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.entity.update.middleware');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasEntityUpdateDetails } from "../../../src/middleware/navigation/update/has.entity.update.middleware";
import * as config from "../../../src/config";
import { getApplicationData } from '../../../src/utils/application.data';
import {
  SERVICE_UNAVAILABLE,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS,
  BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO,
  BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED,
  PAGE_TITLE_ERROR
} from '../../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  ERROR
} from '../../__mocks__/session.mock';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from '../../../src/model/beneficial.owner.statement.model';
import { ManagingOfficerTypeChoice, BeneficialOwnerTypeKey } from '../../../src/model/beneficial.owner.type.model';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockHasEntityUpdate = hasEntityUpdateDetails as jest.Mock;
mockHasEntityUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockGetApplicationData = getApplicationData as jest.Mock;

describe("MANAGING OFFICER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`renders the ${config.UPDATE_MANAGING_OFFICER_TYPE_PAGE} page for managing officers`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED
      });
      const resp = await request(app).get(config.UPDATE_MANAGING_OFFICER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_ALL_IDENTIFIED_ALL_DETAILS);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).not.toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
    });

    test(`renders the ${config.UPDATE_MANAGING_OFFICER_TYPE_PAGE} for managing officers with just the MOs options`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });
      const resp = await request(app).get(config.UPDATE_MANAGING_OFFICER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_LEGEND_TEXT_NONE_IDENTIFIED);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_NONE_IDENTIFIED);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app).get(config.UPDATE_MANAGING_OFFICER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.UPDATE_MANAGING_OFFICER_INDIVIDUAL_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_MANAGING_OFFICER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_MANAGING_OFFICER_INDIVIDUAL_URL);
    });

    test(`redirects to the ${config.UPDATE_MANAGING_OFFICER_CORPORATE_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_MANAGING_OFFICER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.corporate });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_MANAGING_OFFICER_CORPORATE_URL);
    });

    test(`renders the current page with error message when ${BeneficialOwnersStatementType.NONE_IDENTIFIED} has been selected `, async () => {
      const resp = await request(app)
        .post(config.UPDATE_MANAGING_OFFICER_TYPE_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.NONE_IDENTIFIED });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_HEADING_NONE_IDENTIFIED);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_MANAGING_OFFICER_YOU_WANT_TO_ADD);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.UPDATE_MANAGING_OFFICER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });
  });

  describe("POST Submit tests", () => {
    test(`redirects to the ${config.UPDATE_CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_MANAGING_OFFICER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_CHECK_YOUR_ANSWERS_PAGE);
    });
  });
});
