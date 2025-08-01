jest.mock("ioredis");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock('../../../src/utils/update/beneficial_owners_managing_officers_data_fetch');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/utils/trusts');
jest.mock('../../../src/utils/update/review_trusts');
jest.mock('../../../src/utils/update/trust.model.fetch');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/utils/relevant.period');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockJourneyDetectionMiddleware from "../../__mocks__/journey.detection.middleware.mock";

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import request from "supertest";

import app from "../../../src/app";
import { authentication } from "../../../src/middleware/authentication.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import * as config from "../../../src/config";
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import {
  SERVICE_UNAVAILABLE,
  BENEFICIAL_OWNER_MANAGING_OFFICER_TYPE_LEGEND_TEXT,
  BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING,
  BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO,
  BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO,
  REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING,
  NEWLY_ADDED_BENEFICIAL_OWNERS_SUMMARY_TABLE_HEADING,
  MESSAGE_ERROR,
  RELEVANT_PERIOD_INDIVIDUAL_BENEFICIAL_OWNER, ERROR_LIST,
} from '../../__mocks__/text.mock';
import {
  ERROR,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW,
  BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  UPDATE_NEWLY_ADDED_MANAGING_OFFICER_OBJECT_MOCK,
  UPDATE_NEWLY_ADDED_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  MANAGING_OFFICER_OBJECT_MOCK,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK,
  UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK,
  UPDATE_MANAGING_OFFICER_OBJECT_MOCK,
  UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE
} from '../../__mocks__/session.mock';
import { BeneficialOwnersStatementType, BeneficialOwnerStatementKey } from '../../../src/model/beneficial.owner.statement.model';
import { ManagingOfficerKey } from '../../../src/model/managing.officer.model';
import { BeneficialOwnerIndividualKey } from '../../../src/model/beneficial.owner.individual.model';
import { ManagingOfficerCorporateKey } from '../../../src/model/managing.officer.corporate.model';
import { BeneficialOwnerGovKey } from '../../../src/model/beneficial.owner.gov.model';
import { BeneficialOwnerOtherKey } from '../../../src/model/beneficial.owner.other.model';
import { UpdateKey } from '../../../src/model/update.type.model';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { checkEntityRequiresTrusts, getTrustLandingUrl } from '../../../src/utils/trusts';
import { hasTrustsToReview, moveReviewableTrustsIntoReview, resetReviewStatusOnAllTrustsToBeReviewed } from '../../../src/utils/update/review_trusts';
import { retrieveTrustData } from "../../../src/utils/update/trust.model.fetch";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { BeneficialOwnerTypeChoice, BeneficialOwnerTypeKey } from "../../../src/model/beneficial.owner.type.model";
import { RELEVANT_PERIOD_QUERY_PARAM } from "../../../src/config";
import { ErrorMessages } from "../../../src/validation/error.messages";

mockJourneyDetectionMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockHasUpdatePresenterMiddleware = hasUpdatePresenter as jest.Mock;
mockHasUpdatePresenterMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCheckEntityRequiresTrusts = checkEntityRequiresTrusts as jest.Mock;

const mockHasTrustsToReview = hasTrustsToReview as jest.Mock;

const mockGetTrustLandingUrl = getTrustLandingUrl as jest.Mock;

const mockGetApplicationData = getApplicationData as jest.Mock;

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockRetrieveTrustData = retrieveTrustData as jest.Mock;

const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockSetExtraData = setExtraData as jest.Mock;

const mockMoveReviewableTrustsIntoReview = moveReviewableTrustsIntoReview as jest.Mock;

const mockResetReviewStatusOnAllTrustsToBeReviewed = resetReviewStatusOnAllTrustsToBeReviewed as jest.Mock;

describe("BENEFICIAL OWNER TYPE controller", () => {
  let appData;

  beforeEach(() => {
    appData = {};
    jest.clearAllMocks();
    jest.resetModules();
    mockGetApplicationData.mockReset();
    mockHasTrustsToReview.mockReturnValue(false);
    mockIsActiveFeature.mockReset();
  });

  describe("GET tests", () => {

    describe("BOs and MOs to review", () => {
      test.each([
        ['review-beneficial-owner-individual', "review_beneficial_owners_individual", BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK, BeneficialOwnerIndividualKey],
        ['review-beneficial-owner-other', "review_beneficial_owners_corporate", BENEFICIAL_OWNER_OTHER_OBJECT_MOCK, BeneficialOwnerOtherKey],
        ['review-beneficial-owner-gov', "review_beneficial_owners_government_or_public_authority", BENEFICIAL_OWNER_GOV_OBJECT_MOCK, BeneficialOwnerGovKey],
        ['review-individual-managing-officer', "review_managing_officers_individual", MANAGING_OFFICER_OBJECT_MOCK, ManagingOfficerKey],
        ['review-managing-officer-corporate', "review_managing_officers_corporate", MANAGING_OFFICER_CORPORATE_OBJECT_MOCK, ManagingOfficerCorporateKey]
      ])(`redirects to %s review page`, async (reviewType, key, mockObject, appDataBoKey) => {
        appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
        appData[UpdateKey] = { [key]: [mockObject] };

        mockGetApplicationData.mockReturnValueOnce(appData);

        const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
        expect(resp.status).toEqual(302);
        expect(resp.text).toContain("Found. Redirecting to /update-an-overseas-entity/" + reviewType + "?index=0");
        appData[appDataBoKey] = []; // clear popped review data as data propogates to further tests
      });
    });

    describe("No BOs or MOs to review", () => {

      test(`render the update-beneficial-owner-type page with radios to add new BOs and MOs and no reviewed summary table`, async () => {
        appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
        appData[BeneficialOwnerStatementKey] = BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS;

        mockGetApplicationData.mockReturnValueOnce(appData).mockReturnValueOnce(appData);
        const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
        expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFICER_TYPE_LEGEND_TEXT);
        expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_BO);
        expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
        expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
        expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_INDIVIDUAL_MO);
        expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
        expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_MO);
        expect(resp.text).not.toContain(REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING);
      });

      test.each([
        ['BO Individual', BeneficialOwnerIndividualKey, UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK],
        ['BO Other', BeneficialOwnerOtherKey, UPDATE_BENEFICIAL_OWNER_OTHER_OBJECT_MOCK],
        ['BO Gov', BeneficialOwnerGovKey, UPDATE_BENEFICIAL_OWNER_GOV_OBJECT_MOCK],
        ['MO Individual', ManagingOfficerKey, UPDATE_MANAGING_OFFICER_OBJECT_MOCK],
        ['MO Corporate', ManagingOfficerCorporateKey, UPDATE_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK]
      ])(`renders the update-beneficial-owner-type page with reviewed BOs and MOs table displayed when a %s has been reviewed`, async (_, key, mockObject) => {
        let objectWithRef = {};
        objectWithRef = {
          ...mockObject,
          ch_reference: '12345'
        };

        appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
        appData[key] = [objectWithRef];

        mockGetApplicationData.mockReturnValueOnce(appData).mockReturnValueOnce(appData);
        const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
        expect(resp.text).toContain(REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING);
      });

      test.each([
        ['BO Individual', BeneficialOwnerIndividualKey, BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK],
        ['BO Other', BeneficialOwnerOtherKey, BENEFICIAL_OWNER_OTHER_OBJECT_MOCK],
        ['BO Gov', BeneficialOwnerGovKey, BENEFICIAL_OWNER_GOV_OBJECT_MOCK],
        ['MO Individual', ManagingOfficerKey, UPDATE_NEWLY_ADDED_MANAGING_OFFICER_OBJECT_MOCK],
        ['MO Corporate', ManagingOfficerCorporateKey, UPDATE_NEWLY_ADDED_MANAGING_OFFICER_CORPORATE_OBJECT_MOCK]
      ])(`renders the update-beneficial-owner-type page with newly added BOs and MOs table displayed when a %s has been added`, async (_, key, mockObject) => {
        appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
        appData[key] = [mockObject];

        mockGetApplicationData.mockReturnValueOnce(appData).mockReturnValueOnce(appData);
        const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

        expect(resp.status).toEqual(200);
        expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
        expect(resp.text).toContain(NEWLY_ADDED_BENEFICIAL_OWNERS_SUMMARY_TABLE_HEADING);
      });
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw ERROR; });
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} page with first statement selected`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE;

      mockGetApplicationData.mockReturnValueOnce(appData).mockReturnValueOnce(appData);
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_INDIVIDUAL_BENEFICIAL_OWNER);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
    });

    test(`renders the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL} page with first statement de-selected`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_NO_CHANGE;

      mockGetApplicationData.mockReturnValueOnce(appData).mockReturnValueOnce(appData);
      const resp = await request(app).get(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(RELEVANT_PERIOD_INDIVIDUAL_BENEFICIAL_OWNER);
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_CORPORATE_BO );
      expect(resp.text).toContain(BENEFICIAL_OWNER_TYPE_PAGE_GOVERNMENT_BO);
    });
  });

  describe("POST tests", () => {
    test('displays error message when pressing add with no radio buttons selected', async () => {
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[BeneficialOwnerStatementKey] = BeneficialOwnersStatementType.SOME_IDENTIFIED_ALL_DETAILS;
      mockGetApplicationData.mockReturnValueOnce(appData);

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({
          isBeneficialOwnerTypeVisible: "true", // Simulate visibility of the BeneficialOwnerTypeKey field
          BeneficialOwnerTypeKey: null, // No selection made
          BeneficialOwnerTypeRPKey: null // No selection made
        });

      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
    });

    test('displays 2 error messages when in relevant period and pressing add with no radio buttons selected', async () => {
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[BeneficialOwnerStatementKey] = BeneficialOwnersStatementType.ALL_IDENTIFIED_ALL_DETAILS;
      mockGetApplicationData.mockReturnValueOnce(appData);

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM)
        .send({
          isBeneficialOwnerTypeVisible: "true", // Simulate visibility of the BeneficialOwnerTypeKey field
          isBeneficialOwnerTypeRPVisible: "true", // Simulate visibility of the BeneficialOwnerTypeRPKey field
          BeneficialOwnerTypeKey: null, // No selection made
          BeneficialOwnerTypeRPKey: null // No selection made
        });

      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_OR_MANAGING_OFFICER_YOU_WANT_TO_ADD);
      expect(resp.text).toContain(ErrorMessages.SELECT_THE_TYPE_OF_BENEFICIAL_OWNER_YOU_WANT_TO_ADD_RELEVANT_PERIOD);
    });
  });

  describe("POST Submit tests", () => {
    test('redirects to manage trusts interrupt', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockRetrieveTrustData.mockReturnValueOnce(Promise.resolve());
      mockSaveAndContinue.mockReturnValueOnce(Promise.resolve());
      mockSetExtraData.mockReturnValueOnce(null);
      mockGetApplicationData.mockReturnValueOnce({});

      mockHasTrustsToReview.mockReturnValueOnce(true);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(mockRetrieveTrustData).toHaveBeenCalled();
      expect(mockHasTrustsToReview).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
    });

    test('redirects to manage trusts interrupt if update in app data', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockRetrieveTrustData.mockReturnValueOnce(Promise.resolve());
      mockSaveAndContinue.mockReturnValueOnce(Promise.resolve());
      mockSetExtraData.mockReturnValueOnce(null);
      mockGetApplicationData.mockReturnValueOnce({ update: {} });

      mockHasTrustsToReview.mockReturnValueOnce(true);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(mockRetrieveTrustData).toHaveBeenCalled();
      expect(mockHasTrustsToReview).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
    });

    test('redirects to manage trusts interrupt if not fetched trust data already in app data', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockRetrieveTrustData.mockReturnValueOnce(Promise.resolve());
      mockSaveAndContinue.mockReturnValueOnce(Promise.resolve());
      mockSetExtraData.mockReturnValueOnce(null);
      mockGetApplicationData.mockReturnValueOnce({ update: { trust_data_fetched: false } });

      mockHasTrustsToReview.mockReturnValueOnce(true);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(mockRetrieveTrustData).toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(mockHasTrustsToReview).toHaveBeenCalled();

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
    });

    test('moves reviewable trusts into review and redirects to manage trusts interrupt if update trust flag off and cease trusts flag on', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS
      mockRetrieveTrustData.mockReturnValueOnce(Promise.resolve());
      mockSaveAndContinue.mockReturnValueOnce(Promise.resolve());
      mockSetExtraData.mockReturnValueOnce(null);
      mockGetApplicationData.mockReturnValueOnce({ update: { trust_data_fetched: false } });

      mockHasTrustsToReview.mockReturnValueOnce(true);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(mockRetrieveTrustData).toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(mockHasTrustsToReview).toHaveBeenCalled();
      expect(mockMoveReviewableTrustsIntoReview).toHaveBeenCalled();
      expect(mockResetReviewStatusOnAllTrustsToBeReviewed).toHaveBeenCalled();

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
    });

    test('redirects to beneficial owner statements page if no trusts to review', async () => {
      mockRetrieveTrustData.mockReturnValueOnce(Promise.resolve());
      mockSaveAndContinue.mockReturnValueOnce(Promise.resolve());
      mockSetExtraData.mockReturnValueOnce(null);
      mockGetApplicationData.mockReturnValueOnce({});

      mockHasTrustsToReview.mockReturnValueOnce(false);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(mockRetrieveTrustData).toHaveBeenCalled();
      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(mockHasTrustsToReview).toHaveBeenCalled();

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test('redirects to beneficial owner statements page if already reviewed trusts', async () => {

      mockGetApplicationData.mockReturnValueOnce({ update: { trust_data_fetched: true } });
      mockHasTrustsToReview.mockReturnValueOnce(false);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(mockRetrieveTrustData).not.toHaveBeenCalled();
      expect(mockSetExtraData).not.toHaveBeenCalled();
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(mockHasTrustsToReview).toHaveBeenCalled();

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(config.UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test('redirects to add trusts if update trusts flag is on, and trusts are required', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS
      const mockLandingUrl = 'update/mock-get-trust-landing-url';
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockIsActiveFeature
        .mockReturnValueOnce(true);
      mockCheckEntityRequiresTrusts.mockReturnValueOnce(true);
      mockGetTrustLandingUrl.mockReturnValueOnce(mockLandingUrl);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(mockLandingUrl);
    });

    test('does not redirect to add trusts if update trusts flag is on, and trusts are not required', async () => {
      const mockLandingUrl = 'update/mock-get-trust-landing-url';
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockCheckEntityRequiresTrusts.mockReturnValueOnce(false);
      mockGetTrustLandingUrl.mockReturnValueOnce(mockLandingUrl);

      const resp = await request(app).post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).not.toContain(mockLandingUrl);
    });

    test(`redirects to the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL + "?relevant-period=true"} page when the relevant_period=true and Other leegal entity button selected`, async () => {
      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.relevantPeriodIndividual });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_INDIVIDUAL_URL + "?relevant-period=true");
    });

    test(`redirects to the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM } page when the relevant_period=true and Other leegal entity button selected`, async () => {

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.relevantPeriodOtherLegal });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_OTHER_URL + RELEVANT_PERIOD_QUERY_PARAM);
    });

    test(`renders ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL } page with validation errors when no radio button is selected, including reviewed and newly added beneficial owner summaries`, async () => {
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[BeneficialOwnerIndividualKey] = [{ ...BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK, ch_reference: '12345' }, BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK];

      mockGetApplicationData.mockReturnValueOnce(appData).mockReturnValueOnce(appData);

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFFICER_TYPE_PAGE_HEADING);
      expect(resp.text).toContain(BENEFICIAL_OWNER_MANAGING_OFFICER_TYPE_LEGEND_TEXT);
      expect(resp.text).toContain(REVIEWED_BENEFICIAL_OWNER_MANAGING_OFFICER_TABLE_HEADING);
      expect(resp.text).toContain(NEWLY_ADDED_BENEFICIAL_OWNERS_SUMMARY_TABLE_HEADING);
      expect(resp.text).toContain(ERROR_LIST);
    });

    test(`redirects to the ${config.UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM } page when the relevant_period=true and government entity button selected`, async () => {
      appData = APPLICATION_DATA_UPDATE_NO_BO_OR_MO_TO_REVIEW;
      appData[UpdateKey] = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE;

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL)
        .send({ [BeneficialOwnerTypeKey]: BeneficialOwnerTypeChoice.relevantPeriodGovernment });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(config.UPDATE_BENEFICIAL_OWNER_GOV_URL + RELEVANT_PERIOD_QUERY_PARAM);
    });

    test("Catch error when posting submit", async () => {
      mockGetApplicationData.mockImplementationOnce(() => { throw new Error(MESSAGE_ERROR); });

      const resp = await request(app)
        .post(config.UPDATE_BENEFICIAL_OWNER_TYPE_SUBMIT_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
