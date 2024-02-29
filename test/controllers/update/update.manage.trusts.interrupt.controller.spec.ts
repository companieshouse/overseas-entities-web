jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/update/review_trusts');

import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import { UPDATE_BENEFICIAL_OWNER_TYPE_URL, UPDATE_MANAGE_TRUSTS_INTERRUPT_URL, UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { APPLICATION_DATA_MOCK } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT } from '../../__mocks__/text.mock';
import { saveAndContinueButtonText } from '../../__mocks__/save.and.continue.mock';
import { getTrustInReview, hasTrustsToReview, resetTrustInReviewPagesReviewed } from '../../../src/utils/update/review_trusts';
import { Trust } from '../../../src/model/trust.model';

const dummyTrust = {} as Trust;

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue( APPLICATION_DATA_MOCK );

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockHasTrustsToReview = hasTrustsToReview as jest.Mock;
mockHasTrustsToReview.mockReturnValue(false);

const mockGetTrustInReview = getTrustInReview as jest.Mock;
mockGetTrustInReview.mockReturnValue(dummyTrust);

const mockResetTrustInReviewPagesReviewed = resetTrustInReviewPagesReviewed as jest.Mock;

describe('Update - Manage Trusts - Interrupt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("You&#39;re about to review trust information");
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when feature flag is on, redirect to review the trust page', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    test('if has a trust in review, will reset the reviewed page flags before redirect to review the trust page', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      mockHasTrustsToReview.mockReturnValueOnce(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
      expect(mockResetTrustInReviewPagesReviewed).toBeCalledWith(dummyTrust);
    });

    test('if has a trust in review, but no trust returned will redirect to review the trust page', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      mockHasTrustsToReview.mockReturnValueOnce(true);
      mockGetTrustInReview.mockReturnValueOnce(undefined);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
      expect(mockResetTrustInReviewPagesReviewed).not.toBeCalled();
    });

    test('if has no trust in review, will redirect to review the trust page', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      mockHasTrustsToReview.mockReturnValueOnce(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INTERRUPT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
      expect(mockGetTrustInReview).not.toBeCalled();
      expect(mockResetTrustInReviewPagesReviewed).not.toBeCalled();
    });
  });
});
