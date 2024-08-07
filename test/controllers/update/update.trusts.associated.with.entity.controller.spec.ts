jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { APPLICATION_DATA_MOCK, TRUST, UPDATE_OBJECT_MOCK } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT, UPDATE_TRUSTS_ASSOCIATED_ADDED_HEADING, UPDATE_MANAGE_TRUSTS_REVIEWED_HEADING, SAVE_AND_CONTINUE_BUTTON_TEXT } from '../../__mocks__/text.mock';
import { Trust, TrustKey } from '../../../src/model/trust.model';
import { wordCount } from '../../utils/test.utils';
import { ErrorMessages } from "../../../src/validation/error.messages";
import { beneficialOwnerIndividualType, beneficialOwnerOtherType, updateType } from "../../../src/model";
import { ADD_TRUST_TEXTS } from "../../../src/utils/add.trust";
import { ChangeBoRelevantPeriodType } from "../../../src/model/relevant.period.statment.model";

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

describe('Update - Trusts - Trusts associated with the overseas entity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test.each([
      [
        "are BO's eligible for trusts",
        "with",
        { ...APPLICATION_DATA_MOCK },
        true
      ],
      [
        "are no BO's eligible for trusts",
        "without",
        {
          ...APPLICATION_DATA_MOCK,
          [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ ],
          [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ ]
        },
        false
      ],
    ])("when FEATURE_FLAG_ENABLE_UPDATE_TRUSTS feature flag is on and there %s, page is returned %s the add another trust option", async (_description1, _description2, appData, isAddTrustsOptionToBeShown) => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockGetApplicationData.mockReturnValue( appData );

      const resp = await request(app).get(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Trusts associated with the overseas entity');
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      if (isAddTrustsOptionToBeShown) {
        expect(resp.text).toContain(ADD_TRUST_TEXTS.subtitle);
      } else {
        expect(resp.text).not.toContain(ADD_TRUST_TEXTS.subtitle);
      }
    });

    test('when reviewed and added trusts exist, page is returned with 2 separate summary tables', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK,
        [TrustKey]: [
          TRUST,
          {
            ...TRUST,
            trust_id: "1",
            ch_reference: "123"
          } as Trust
        ]
      });

      const resp = await request(app).get(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Trusts associated with the overseas entity');
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).toContain(UPDATE_TRUSTS_ASSOCIATED_ADDED_HEADING);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEWED_HEADING);
      expect(resp.text).toContain("href=\"update-tell-us-about-the-trust/#name\" data-event-id=\"change-trust-button\"");
      expect(resp.text).toContain("href=\"/update-an-overseas-entity/update-manage-trusts-orchestrator/change/1\" data-event-id=\"change-trust-button\"");
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test.each([
      [
        "when trust ceased date feature flag off, reviewed trust status will not", false, 0, 0
      ],
      [
        "when trust ceased date feature flag on, reviewed trust status will", true, 1, 2
      ],
    ])('%s be shown in summary table', async (_, ceasedDateFeatureFlagValue, expectedRemovedCount, expectedActiveCount) => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockIsActiveFeature.mockReturnValueOnce(ceasedDateFeatureFlagValue); // FEATURE_FLAG_ENABLE_CEASE_TRUSTS

      // trust with ch_references indicates a reviewable trust (ie it would be an existing trust that has come from chips)
      mockGetApplicationData.mockReturnValue({
        ...APPLICATION_DATA_MOCK,
        [TrustKey]: [
          TRUST,
          {
            // a ceased reviewed trust
            ...TRUST,
            ceased_date_day: "11",
            ceased_date_month: "12",
            ceased_date_year: "2022",
            trust_id: "1",
            ch_reference: "123"
          } as Trust,
          {
            // an active (non ceased) reviewed trust
            ...TRUST,
            trust_id: "2",
            ch_reference: "123"
          } as Trust
        ]
      });

      const resp = await request(app).get(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Trusts associated with the overseas entity');
      expect(resp.text).toContain(UPDATE_TRUSTS_ASSOCIATED_ADDED_HEADING);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEWED_HEADING);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(wordCount("Removed", resp.text)).toEqual(expectedRemovedCount);
      expect(wordCount("Active", resp.text)).toEqual(expectedActiveCount);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when FEATURE_FLAG_ENABLE_UPDATE_TRUSTS feature flag is on, and no trusts are to be added, redirect to beneficial owner statements page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: '0' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test('when FEATURE_FLAG_ENABLE_UPDATE_TRUSTS feature flag is on, and trusts are to be added, redirect to add trust page', async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: 'addTrustYes' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE);
    });

    test("when FEATURE_FLAG_ENABLE_UPDATE_TRUSTS feature flag is on and BO's are eligible for trusts and no add trust option selected on page, add trust button validation should return error message", async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_MOCK } );

      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: '' });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.ADD_TRUST);
    });

    test("when FEATURE_FLAG_ENABLE_UPDATE_TRUSTS feature flag is on " +
      "and FEATURE_FLAG_ENABLE_RELEVANT_PERIOD is on " +
      "and no BO's are eligible for trusts and is a relevant period and no add trust option selected on page, add trust button validation should run", async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_RELEVANT_PERIOD

      mockGetApplicationData.mockReturnValue( {
        ...APPLICATION_DATA_MOCK,
        [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ ],
        [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ ],
        [updateType.UpdateKey]: {
          ...UPDATE_OBJECT_MOCK,
          ['change_bo_relevant_period']: ChangeBoRelevantPeriodType.YES
        }
      } );

      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: '' });

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.ADD_TRUST);
    });

    test("when FEATURE_FLAG_ENABLE_UPDATE_TRUSTS feature flag is on and no BO's are eligible for trusts and no add trust option selected on page, add trust button validation should not run", async () => {
      mockIsActiveFeature.mockReturnValue(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockGetApplicationData.mockReturnValue( {
        ...APPLICATION_DATA_MOCK,
        [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [ ],
        [beneficialOwnerOtherType.BeneficialOwnerOtherKey]: [ ]
      } );

      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: '' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
      expect(resp.text).not.toContain(ErrorMessages.ADD_TRUST);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});

