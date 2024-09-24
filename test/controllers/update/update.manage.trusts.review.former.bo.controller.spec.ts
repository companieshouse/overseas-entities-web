jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/save.and.continue');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import { SECURE_UPDATE_FILTER_URL, UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL, UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL, UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { checkBOsDetailsEntered, getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { TRUST } from '../../__mocks__/session.mock';
import { ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE, UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_TABLE_HEADING, UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_TITLE } from '../../__mocks__/text.mock';
import { UpdateKey } from '../../../src/model/update.type.model';
import { Trust, TrustHistoricalBeneficialOwner } from '../../../src/model/trust.model';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { ApplicationData } from '../../../src/model';
import { saveAndContinue } from '../../../src/utils/save.and.continue';

const appDataWithReviewTrust = {
  [UpdateKey]: {
    review_trusts: [
      {
        ...TRUST,
        trust_id: "1",
        HISTORICAL_BO: [
          {
            id: "1234",
            forename: "BO",
            surname: "Individual",
            ch_references: "",
            corporate_indicator: yesNoResponse.No,
            ceased_date_day: "30",
            ceased_date_month: "8",
            ceased_date_year: "2022",
            notified_date_day: "30",
            notified_date_month: "8",
            notified_date_year: "1992",
          } as TrustHistoricalBeneficialOwner,
          {
            id: "5678",
            ch_references: "",
            corporate_name: "BO Corporate",
            corporate_indicator: yesNoResponse.No,
            ceased_date_day: "2",
            ceased_date_month: "2",
            ceased_date_year: "2022",
            notified_date_day: "3",
            notified_date_month: "3",
            notified_date_year: "2022",
          } as TrustHistoricalBeneficialOwner
        ],
        review_status: {
          in_review: true,
          reviewed_trust_details: false,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        }
      } as Trust
    ]
  }
} as ApplicationData;

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCheckBOsDetailsEntered = checkBOsDetailsEntered as jest.Mock;
mockCheckBOsDetailsEntered.mockReturnValue(true);

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Update - Manage Trusts - Review former beneficial owners', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_TITLE);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_TABLE_HEADING);
      expect(resp.text).toContain("BO Individual");
      expect(resp.text).toContain("BO Corporate");
      expect(resp.text).toContain("name of trust");
      expect(resp.text).toContain("March");
      expect(resp.text).toContain("August");
    });

    test('when feature flag is on, redirect if user tries to access with no trust to review', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      const appData = { [UpdateKey]: { review_trusts: [] } } as ApplicationData;
      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
    });

    test('when feature flag is on, redirect if user tries to access with no BOs to review', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      const appData = {
        [UpdateKey]: {
          review_trusts: [
            {
              ...TRUST,
              trust_id: "1",
              HISTORICAL_BO: []
            } as Trust
          ]
        }
      } as ApplicationData;

      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
    });

    test("catch error when rendering the page", async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValue(true);
      const appData = { [UpdateKey]: { review_trusts: [] } } as ApplicationData;
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe('POST tests', () => {
    test('when feature flag is on, and clicking to add new former BO, redirects to update-manage-trusts-tell-us-about-the-former-bo', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL).send({ addFormerBo: 'addFormerBo' });

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);
    });

    test('when feature flag is on, and clicking no more to add, redirects to update-manage-trusts-orchestrator', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL).send({ noMoreToAdd: 'noMoreToAdd' });

      expect(resp.status).toEqual(302);
      expect(mockSaveAndContinue).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test("catch error when posting", async () => {
      mockGetApplicationData.mockReturnValueOnce({});
      mockIsActiveFeature.mockReturnValue(true);
      const appData = { [UpdateKey]: { review_trusts: [] } } as ApplicationData;
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });
});
