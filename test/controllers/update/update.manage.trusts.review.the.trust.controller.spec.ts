jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/update/review_trusts');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import { SECURE_UPDATE_FILTER_URL, UPDATE_MANAGE_TRUSTS_INTERRUPT_URL, UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL, UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { APPLICATION_DATA_MOCK, BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK, BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK, TRUST } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT, ERROR_LIST, UPDATE_REVIEW_THE_TRUST, ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, TRUST_NOT_ASSOCIATED_WITH_BENEFICIAL_OWNER_TEXT, TRUST_CEASED_DATE_TEXT, TRUST_SELECT_TRUSTEES_TEXT, SAVE_AND_CONTINUE_BUTTON_TEXT } from '../../__mocks__/text.mock';
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { ErrorMessages } from "../../../src/validation/error.messages";
import { getReviewTrustById, hasTrustsToReview, updateTrustInReviewList } from '../../../src/utils/update/review_trusts';
import { UpdateKey } from '../../../src/model/update.type.model';
import { Trust } from '../../../src/model/trust.model';
import { ApplicationData } from '../../../src/model/application.model';
import { beneficialOwnerIndividualType, beneficialOwnerOtherType } from '../../../src/model';
import { DateTime } from 'luxon';

const mockTrust = {
  ...TRUST,
  trust_id: "1",
  beneficialOwnersIds: ['45e4283c-6b05-42da-ac9d-1f7bf9fe9c85'],
  review_status: {
    in_review: false,
    reviewed_trust_details: false,
    reviewed_former_bos: false,
    reviewed_individuals: false,
    reviewed_legal_entities: false,
  }
} as Trust;

const appDataWithReviewTrust = {
  ...APPLICATION_DATA_MOCK,
  [UpdateKey]: {
    review_trusts: [
      mockTrust
    ]
  }
} as ApplicationData;

// App data with no BOs that have trust NOCs
const appDataWithNoTrustNocBOs = {
  ...APPLICATION_DATA_MOCK,
  [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ BENEFICIAL_OWNER_INDIVIDUAL_NO_TRUSTEE_OBJECT_MOCK ],
  [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ BENEFICIAL_OWNER_OTHER_NO_TRUSTEE_OBJECT_MOCK ],
  [UpdateKey]: {
    review_trusts: [
      mockTrust
    ]
  }
} as ApplicationData;

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;

const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;

const mockHasTrustsToReview = hasTrustsToReview as jest.Mock;
mockHasTrustsToReview.mockReturnValue(true);

const mockGetReviewTrustById = getReviewTrustById as jest.Mock;
mockGetReviewTrustById.mockReturnValue(mockTrust);

const mockUpdateTrustInReviewList = updateTrustInReviewList as jest.Mock;

describe('Update - Manage Trusts - Review the trust', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);
  });

  describe('GET tests', () => {
    test('when manage trusts feature flag is on, page is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Review the trust");
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(TRUST_CEASED_DATE_TEXT);
      expect(resp.text).toContain("Is the trust still involved in the overseas entity?");
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(TRUST_NOT_ASSOCIATED_WITH_BENEFICIAL_OWNER_TEXT);
    });

    test('when manage trusts feature flag is on, cease trusts flag is off, ceased date not displayed when no associated BOs', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      // page should not contain new ceased date info as ceased date flag is FALSE
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Review the trust");
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(TRUST_NOT_ASSOCIATED_WITH_BENEFICIAL_OWNER_TEXT);
      expect(resp.text).not.toContain(TRUST_CEASED_DATE_TEXT);
    });

    test('when feature flags are on and no associated beneficial owners, page shows ceased date', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Review the trust");
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(TRUST_NOT_ASSOCIATED_WITH_BENEFICIAL_OWNER_TEXT);
      expect(resp.text).toContain(TRUST_CEASED_DATE_TEXT);
      expect(resp.text).not.toContain(TRUST_SELECT_TRUSTEES_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when manage trusts feature flag is on, redirect if no trusts to review', async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockHasTrustsToReview.mockReturnValueOnce(false);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
    });

    test('when manage trusts feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe('POST tests', () => {

    const ceasedDateScenarioFixtures = [
      [
        "missing ceased date DAY error message",
        {
          ceasedDateMonth: "11",
          ceasedDateYear: "2021"
        },
        ErrorMessages.DAY_OF_CEASED_TRUST
      ],
      [
        "missing ceased date MONTH error message",
        {
          ceasedDateDay: "11",
          ceasedDateYear: "2021"
        },
        ErrorMessages.MONTH_OF_CEASED_TRUST
      ],
      [
        "missing ceased date YEAR error message",
        {
          ceasedDateDay: "11",
          ceasedDateMonth: "5"
        },
        ErrorMessages.YEAR_OF_CEASED_TRUST
      ],
      [
        "invalid ceased date YEAR length error message",
        {
          ceasedDateDay: "11",
          ceasedDateMonth: "5",
          ceasedDateYear: "21"
        },
        ErrorMessages.YEAR_LENGTH_OF_CEASED_TRUST
      ],
      [
        "invalid ceased date DAY length error message",
        {
          ceasedDateDay: "111",
          ceasedDateMonth: "5",
          ceasedDateYear: "21"
        },
        ErrorMessages.DAY_LENGTH_OF_CEASED_TRUST
      ],
      [
        "invalid ceased date MONTH length error message",
        {
          ceasedDateDay: "11",
          ceasedDateMonth: "544",
          ceasedDateYear: "21"
        },
        ErrorMessages.MONTH_LENGTH_OF_CEASED_TRUST
      ],
      [
        "invalid ceased date error message",
        {
          ceasedDateDay: "31",
          ceasedDateMonth: "2",
          ceasedDateYear: "2023"
        },
        ErrorMessages.INVALID_DATE_OF_CEASED_TRUST
      ],
      [
        "future ceased date error message",
        {
          ceasedDateDay: "11",
          ceasedDateMonth: "2",
          ceasedDateYear: "9024"
        },
        ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_CEASED_TRUST
      ],
      [
        "day and month ceased date missing error message",
        {
          ceasedDateYear: "2023"
        },
        ErrorMessages.DAY_AND_MONTH_OF_CEASED_TRUST
      ],
      [
        "month and year ceased date missing error message",
        {
          ceasedDateDay: "23"
        },
        ErrorMessages.MONTH_AND_YEAR_OF_CEASED_TRUST
      ],
      [
        "day and year ceased date missing error message",
        {
          ceasedDateMonth: "11"
        },
        ErrorMessages.DAY_AND_YEAR_OF_CEASED_TRUST
      ],
      [
        "ceased date must not be before creation date error message",
        {
          createdDateDay: "11",
          createdDateMonth: "2",
          createdDateYear: "2000",
          ceasedDateDay: "10",
          ceasedDateMonth: "2",
          ceasedDateYear: "2000"
        },
        ErrorMessages.TRUST_CEASED_DATE_BEFORE_CREATED_DATE
      ]
    ];

    test('when update manage trusts feature flag is on, redirect to review former bo page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({
          name: 'Updated Trust name',
          beneficialOwnersIds: ['45e4283c-6b05-42da-ac9d-1f7bf9fe9c85'],
          stillInvolved: '1',
          hasAllInfo: '0',
          trustId: '1'
        });

      expect(resp.status).toEqual(302);
      expect(mockGetReviewTrustById).toHaveBeenCalled();
      expect(mockUpdateTrustInReviewList).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test('when valid ceased date is posted, and no associated BOs, it should be added to the trust data', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const DAY = "11";
      const MONTH = "12";
      const YEAR = "2021";
      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({
          name: 'Updated Trust name',
          hasAllInfo: '0',
          trustId: '1',
          beneficialOwnersIds: [],
          ceasedDateDay: DAY,
          ceasedDateMonth: MONTH,
          ceasedDateYear: YEAR
        });

      expect(resp.status).toEqual(302);
      expect(mockGetReviewTrustById).toHaveBeenCalled();
      const trust: Trust = mockUpdateTrustInReviewList.mock.calls[0][1];
      expect(trust.ceased_date_day).toEqual(DAY);
      expect(trust.ceased_date_month).toEqual(MONTH);
      expect(trust.ceased_date_year).toEqual(YEAR);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test(`renders the update-manage-trusts-review-the-trust page with error messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockIsActiveFeature.mockReturnValueOnce(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.TRUST_NAME_2);
      expect(resp.text).toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).toContain(ErrorMessages.TRUST_STILL_INVOLVED);
      expect(resp.text).toContain(ErrorMessages.TRUST_HAS_ALL_INFO);
      expect(mockUpdateTrustInReviewList).not.toHaveBeenCalled();
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the update-manage-trusts-review-the-trust page with missing ceased date error message when no eligible BOs`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.TRUST_NAME_2);
      expect(resp.text).not.toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).toContain(ErrorMessages.TRUST_HAS_ALL_INFO);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_TRUST_CEASED);
      expect(mockUpdateTrustInReviewList).not.toHaveBeenCalled();
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test(`renders the update-manage-trusts-review-the-trust page with missing ceased date error message when eligible BOs and no longer involved but date not entered`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with trust associated BOs
      mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL).send({ stillInvolved: "0" });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.TRUST_NAME_2);
      expect(resp.text).not.toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).toContain(ErrorMessages.TRUST_HAS_ALL_INFO);
      expect(resp.text).toContain(ErrorMessages.ENTER_DATE_OF_TRUST_CEASED);
      expect(mockUpdateTrustInReviewList).not.toHaveBeenCalled();
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    // Test the trust ceased date validation combinations when no BOs have Trust nature of controls
    test.each(ceasedDateScenarioFixtures)(`renders the update-manage-trusts-review-the-trust page when no BOs have Trust nature of controls with %s`, async (_, formData, errorMessage) => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send(formData);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).not.toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).toContain(errorMessage);
    });

    // Test the trust ceased date validation combinations when trust no longer involved with the OE
    test.each(ceasedDateScenarioFixtures)(`renders the update-manage-trusts-review-the-trust page when trust no longer involved with the OE with %s`, async (_, formData, errorMessage) => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with trust associated BOs
      mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({ ...formData, stillInvolved: "0" }); // Trust marked as no longer involved with the OE, so the ceased date error should appear on the page

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(errorMessage);
    });

    test(`renders the update-manage-trusts-review-the-trust page with NO ceased date error message when using today's date`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);
      const today = DateTime.now();
      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({
          ceasedDateDay: today.day.toString(),
          ceasedDateMonth: today.month.toString(),
          ceasedDateYear: today.year.toString()
        });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).not.toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).not.toContain(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_CEASED_TRUST);
    });

    test(`renders the update-manage-trusts-review-the-trust page with NO ceased date error message when ceased date is same as created date`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({
          createdDateDay: "11",
          createdDateMonth: "2",
          createdDateYear: "2000",
          ceasedDateDay: "11",
          ceasedDateMonth: "2",
          ceasedDateYear: "2000"
        });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).not.toContain(ErrorMessages.TRUST_CEASED_DATE_BEFORE_CREATED_DATE);
    });

    test(`renders the update-manage-trusts-review-the-trust page without ceased date validation when cease trusts feature flag is off`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS in trust.details.validation

      // use app data with no trust associated BOs - i.e. no BOs have Trust nature of controls
      mockGetApplicationData.mockReturnValue(appDataWithNoTrustNocBOs);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({
          beneficialOwnersIds: [],
          ceasedDateMonth: "11"
        });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).not.toContain(ErrorMessages.DAY_AND_YEAR_OF_CEASED_TRUST);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    test("catch error when posting", async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
