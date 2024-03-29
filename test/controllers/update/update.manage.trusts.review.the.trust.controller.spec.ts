jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/update/review_trusts');

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
import { APPLICATION_DATA_MOCK, TRUST } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT, ERROR_LIST, UPDATE_REVIEW_THE_TRUST, ANY_MESSAGE_ERROR, SERVICE_UNAVAILABLE } from '../../__mocks__/text.mock';
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { saveAndContinueButtonText } from '../../__mocks__/save.and.continue.mock';
import { ErrorMessages } from "../../../src/validation/error.messages";
import { getReviewTrustById, hasTrustsToReview, updateTrustInReviewList } from '../../../src/utils/update/review_trusts';
import { UpdateKey } from '../../../src/model/update.type.model';
import { Trust } from '../../../src/model/trust.model';
import { ApplicationData } from '../../../src/model/application.model';

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

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue(appDataWithReviewTrust);

const mockSaveAndContinue = saveAndContinue as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockHasTrustsToReview = hasTrustsToReview as jest.Mock;
mockHasTrustsToReview.mockReturnValue(true);

const mockGetReviewTrustById = getReviewTrustById as jest.Mock;
mockGetReviewTrustById.mockReturnValue(mockTrust);

const mockUpdateTrustInReviewList = updateTrustInReviewList as jest.Mock;

describe('Update - Manage Trusts - Review the trust', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Review the trust");
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is on, redirect if no trusts to review', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockHasTrustsToReview.mockReturnValueOnce(false);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(302);
      expect(resp.text).toContain(SECURE_UPDATE_FILTER_URL);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(500);
      expect(resp.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe('POST tests', () => {
    test('when feature flag is on, redirect to review former bo page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL)
        .send({
          name: 'Updated Trust name',
          beneficialOwnersIds: ['45e4283c-6b05-42da-ac9d-1f7bf9fe9c85'],
          hasAllInfo: '0',
          trustId: '1'
        });

      expect(resp.status).toEqual(302);
      expect(mockGetReviewTrustById).toHaveBeenCalled();
      expect(mockUpdateTrustInReviewList).toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test(`renders the update-manage-trusts-review-the-trust page with error messages`, async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_REVIEW_THE_TRUST);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(ErrorMessages.TRUST_NAME_2);
      expect(resp.text).toContain(ErrorMessages.TRUST_INVOLVED_BOS);
      expect(resp.text).toContain(ErrorMessages.TRUST_HAS_ALL_INFO);
      expect(mockUpdateTrustInReviewList).not.toHaveBeenCalled();
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
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
