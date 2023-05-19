jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock('../../../src/utils/update/beneficial_owners_managing_officers_data_fetch');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import * as config from "../../../src/config";
import { getApplicationData } from '../../../src/utils/application.data';
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
  PAGE_TITLE_ERROR,
  REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING,
  NEWLY_ADDED_BENEFICIAL_OWNERS_SUMMARY_TABLE_HEADING
} from '../../__mocks__/text.mock';
import {
  APPLICATION_DATA_MOCK,
  APPLICATION_DATA_UPDATE_BO_MOCK,
  ERROR,
  REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA,
  UNDEFINED_UPDATE_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK_REVIEW_MODEL,
  UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  APPLICATION_DATA_MOCK_NEWLY_ADDED_BO,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL,
} from '../../__mocks__/session.mock';
import { ErrorMessages } from '../../../src/validation/error.messages';
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from '../../../src/model/beneficial.owner.statement.model';
import { BeneficialOwnerTypeChoice, ManagingOfficerTypeChoice, BeneficialOwnerTypeKey } from '../../../src/model/beneficial.owner.type.model';
import { ManagingOfficerKey } from '../../../src/model/managing.officer.model';
import { getCompanyOfficers } from "../../../src/service/company.managing.officer.service";
import { BeneficialOwnerIndividualKey } from '../../../src/model/beneficial.owner.individual.model';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import {
  MOCK_GET_COMPANY_PSC_RESOURCE,
  MOCK_GET_COMPANY_PSC_RESOURCE_CORPORATE_ENTITY,
  MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV
} from '../../__mocks__/get.company.psc.mock';
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';
import { hasFetchedBoAndMoData, setFetchedBoMoData } from '../../../src/utils/update/beneficial_owners_managing_officers_data_fetch';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasUpdatePresenterMiddleware = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockSetBoMoData = setFetchedBoMoData as jest.Mock;
const mockHasFetchedBoAndMoData = hasFetchedBoAndMoData as jest.Mock;

describe("BENEFICIAL OWNER TYPE controller", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReset();
    mockGetCompanyPscService.mockReset();
  });

  describe("GET tests", () => {

    test(`render the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page with table of reviewed BOs if BOs have been reviewed`, async () => {
      const reviewBoAppData = { ...APPLICATION_DATA_UPDATE_BO_MOCK };
      delete reviewBoAppData["beneficial_owners_individual"];
      reviewBoAppData["beneficial_owners_individual"] = [UPDATE_REVIEW_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK];

      mockGetApplicationData.mockReturnValueOnce({
        ...reviewBoAppData
      });

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING);
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page without review BO table if no BOs have been reviewed`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        ...APPLICATION_DATA_UPDATE_BO_MOCK });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).not.toContain(REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING);
    });

    test(`redirection to ${config.UPDATE_REVIEW_BENEFICIAL_OWNER_GOV_PAGE} page if beneficial owner application data`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ...REVIEW_BENEFICIAL_OWNER_GOV_REQ_BODY_OBJECT_MOCK_WITH_FULL_DATA
      });
      mockHasFetchedBoAndMoData.mockReturnValue(false);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV);
      mockGetCompanyOfficers.mockReturnValueOnce(MOCK_GET_COMPANY_OFFICERS);

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(302);
      expect(resp.text).toContain('Found. Redirecting to /update-an-overseas-entity/review-beneficial-owner-gov?index=1');
    });

    test(`render the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page for beneficial owners and managing officers`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        ...UPDATE_OBJECT_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
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
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(mockGetCompanyPscService).toHaveBeenCalled();
      expect(mockGetCompanyOfficers).toHaveBeenCalled();
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page but does not re-make API call for managing officers`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        [ManagingOfficerKey]: [],
      });
      mockHasFetchedBoAndMoData.mockReturnValue(true);

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(mockGetCompanyOfficers).not.toHaveBeenCalled();
    });

    test(`redirection to beneficial owner review page if beneficial owner application data`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ...UPDATE_OBJECT_MOCK_REVIEW_MODEL,
      });
      mockHasFetchedBoAndMoData.mockReturnValue(false);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      mockGetCompanyOfficers.mockReturnValueOnce(MOCK_GET_COMPANY_OFFICERS);

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(302);
      expect(resp.text).toContain('Redirecting to /update-an-overseas-entity/review-beneficial-owner-individual?index=2');
    });

    test(`redirection to beneficial owner other legal review page if BO to review`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_UPDATE_BO_MOCK,
        ...UPDATE_OBJECT_MOCK_REVIEW_BO_OTHER_MODEL,
        beneficial_owners_individual: {}
      });
      mockHasFetchedBoAndMoData.mockReturnValue(false);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE_CORPORATE_ENTITY);
      mockGetCompanyOfficers.mockReturnValueOnce({});

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toEqual('Found. Redirecting to /update-an-overseas-entity/review-beneficial-owner-other?index=1');
    });

    test(`test other benefical owner data returned when getCompanyPsc data kind is other`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });

      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE.items[0].kind = 'legal-person-beneficial-owner');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);

    });

    test(`test that getCompanyOfficers is not called again if it returns undefined`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      mockGetCompanyOfficers.mockReturnValueOnce(undefined);

      expect(mockGetCompanyOfficers).toBeCalledTimes(1);
      expect(mockSetBoMoData).toBeTruthy;
    });

    test(`test corporate managing officer data returned when getCompanyOfficers data officer role is corporate-managing-officer`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      mockGetCompanyOfficers.mockReturnValueOnce(MOCK_GET_COMPANY_OFFICERS);
      mockGetCompanyOfficers.mockReturnValueOnce(MOCK_GET_COMPANY_OFFICERS.items[0].officerRole = 'corporate-managing-officer');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyOfficers).toBeCalledTimes(1);
    });

    test(`test that undefined is returned if getCompanyOfficers is called without entity number`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(mockSetBoMoData).toBeTruthy;
    });

    test(`test individual managing officer data returned when getCompanyOfficers data officer role is managing-officer`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      mockGetCompanyOfficers.mockReturnValueOnce(MOCK_GET_COMPANY_OFFICERS);
      mockGetCompanyOfficers.mockReturnValueOnce(MOCK_GET_COMPANY_OFFICERS.items[0].officerRole = 'managing-officer');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyOfficers).toBeCalledTimes(1);
    });

    test(`test that undefined is returned if getCompanyPsc owner data is called without entity number`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toHaveBeenCalled();
      expect(mockSetBoMoData).toBeTruthy;
    });

    test(`test corporate benefical owner data returned when getCompanyPsc data kind is corporate entity beneficial owner`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE);
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE.items[0].kind = 'corporate-entity-beneficial-owner');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);
    });

    test(`test individual benefical owner data returned when getCompanyPsc data kind is individual person with significant control`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      mockGetCompanyPscService.mockReturnValueOnce(MOCK_GET_COMPANY_PSC_RESOURCE.items[0].kind = 'individual-beneficial-owner');

      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(mockGetCompanyPscService).toBeCalledTimes(1);
    });

    test(`test that getCompanyPsc is not called again if it returns undefined`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
      });
      await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      mockGetCompanyPscService.mockReturnValueOnce(undefined);

      expect(mockGetCompanyPscService).toBeCalledTimes(1);
      expect(mockSetBoMoData).toBeTruthy;
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

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page with newly added BO's table displayed`, async () => {
      mockGetApplicationData.mockReturnValueOnce({ ...APPLICATION_DATA_MOCK_NEWLY_ADDED_BO });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(NEWLY_ADDED_BENEFICIAL_OWNERS_SUMMARY_TABLE_HEADING);
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page without newly added BO's table displayed`, async () => {
      const data = { ...APPLICATION_DATA_MOCK };
      delete data[BeneficialOwnerIndividualKey];
      const boiNoChReference = BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK;
      boiNoChReference["ch_reference"] = "123";
      data[BeneficialOwnerIndividualKey] = [boiNoChReference];

      mockGetApplicationData.mockReturnValueOnce({ ...data });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).not.toContain(NEWLY_ADDED_BENEFICIAL_OWNERS_SUMMARY_TABLE_HEADING);
    });

    test(`redirect to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page with empty app data`, async () => {
      mockGetApplicationData.mockReturnValue({});
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
    });

    test (`redirect to ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page with undefined update appData`, async() => {
      mockGetApplicationData.mockReturnValue({
        ...UNDEFINED_UPDATE_OBJECT_MOCK
      });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
    });
  });

  describe("GET PSC tests", () => {
    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_PAGE} page, doesn't call getCompanyPsc if BeneficialOwnerIndividualKey exists`, async () => {
      mockGetApplicationData.mockReturnValueOnce({
        ...APPLICATION_DATA_MOCK,
        [BeneficialOwnerStatementKey]: BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS,
        [BeneficialOwnerIndividualKey]: []
      });
      mockHasFetchedBoAndMoData.mockReturnValue(true);

      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
      expect(mockGetCompanyPscService).not.toHaveBeenCalled();
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
