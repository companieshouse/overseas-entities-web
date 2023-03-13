jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/service/persons.with.signficant.control.service');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import * as config from "../../../src/config";
import { getApplicationData, setApplicationData } from '../../../src/utils/application.data';
import {
  SERVICE_UNAVAILABLE,
  BENEFICIAL_OWNER_MANAGING_OFFICER_TYPE_LEGEND_TEXT,
  BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING,
  BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED,
  BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO,
  PAGE_TITLE_ERROR
} from '../../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  ERROR,
} from '../../__mocks__/session.mock';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from '../../../src/model/beneficial.owner.statement.model';
import { BeneficialOwnerTypeChoice, ManagingOfficerTypeChoice, BeneficialOwnerTypeKey } from '../../../src/model/beneficial.owner.type.model';
import { BeneficialOwnerIndividualKey } from '../../../src/model/beneficial.owner.individual.model';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import { MOCK_GET_COMPANY_PSC_RESOURCE } from '../../__mocks__/get.company.psc.mock';
import { BeneficialOwnerGovKey } from '../../../src/model/beneficial.owner.gov.model';
import { BeneficialOwnerOtherKey } from '../../../src/model/beneficial.owner.other.model';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasUpdatePresenterMiddleware = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockSetApplicationData = setApplicationData as jest.Mock;

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;

describe("BENEFICIAL OWNER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET tests", () => {
    test(`render the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for beneficial owners and managing officers`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: undefined
      });
      mockGetCompanyPscService.mockReturnValueOnce({});
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(mockGetCompanyPscService).toHaveBeenCalled();
    });

    test(`test that getCompanyPsc is not called again if it returns undefined`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        [BeneficialOwnerIndividualKey]: undefined,
      });
      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      mockGetCompanyPscService.mockReturnValueOnce(undefined);

      expect(mockGetCompanyPscService).toBeCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalled();
      expect([BeneficialOwnerIndividualKey]).toEqual(["beneficial_owners_individual"]);
      expect([BeneficialOwnerOtherKey]).toEqual(["beneficial_owners_corporate"]);
      expect([BeneficialOwnerGovKey]).toEqual(["beneficial_owners_government_or_public_authority"]);
    });

    test(`test that undefined is returned if getCompanyPsc owner data is called without entity number`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerIndividualKey]: undefined
      });
      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);
      expect(mockSetApplicationData).toHaveBeenCalled();
    });

    test(`test individual benefical owner data returned when getCompanyPsc data kind is individual person with significant control`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        [BeneficialOwnerIndividualKey]: undefined
      });
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE.items[0].kind = 'individual-person-with-significant-control');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);
      expect(mockSetApplicationData).toBeCalledTimes(1);
    });

    test(`test Other benefical owner data returned when getCompanyPsc data kind is other`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        [BeneficialOwnerIndividualKey]: undefined
      });
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE.items[0].kind = 'legal-person-with-significant-control');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);
    });

    test(`test corporate benefical owner data returned when getCompanyPsc data kind is corporate entity beneficial owner`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        [BeneficialOwnerIndividualKey]: undefined
      });
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE.items[0].kind = 'corporate-entity-beneficial-owner');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);
      expect(mockSetApplicationData).toBeCalledTimes(1);
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page, doesn't call getCompanyPsc if BeneficialOwnerIndividualKey exists`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: []
      });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(mockGetCompanyPscService).not.toHaveBeenCalled();
      expect(mockSetApplicationData).not.toHaveBeenCalled();
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for beneficial owners with just the BOs options`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFICER_TYPE_LEGEND_TEXT);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_ADD_BUTTON_ALL_IDENTIFIED);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce( () => { throw ERROR; });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe("POST tests", () => {
    test(`redirects to the ${config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL);
    });

    test(`redirects to the ${config.UPDATE_BENEFICIAL_OWNER_OTHER_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.otherLegal });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_OTHER_URL);
    });

    test(`redirects to the ${config.UPDATE_BENEFICIAL_OWNER_GOV_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.government });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_GOV_URL);
    });

    test(`redirects to the ${config.UPDATE_MANAGING_OFFICER_URL} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.individual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_MANAGING_OFFICER_URL);
    });

    test(`redirects to the ${config.UPDATE_MANAGING_OFFICER_CORPORATE_URL} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: ManagingOfficerTypeChoice.corporate });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_MANAGING_OFFICER_CORPORATE_URL);
    });

    test(`renders the current page with error message when ${BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS} has been selected `, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
    });

    test(`POST empty object and check for error in page title`, async () => {
      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
    });
  });

  describe("POST Submit tests", () => {
    test(`redirects to the ${config.UPDATE_CHECK_YOUR_ANSWERS_PAGE} page`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_CHECK_YOUR_ANSWERS_PAGE);
    });
  });
});
