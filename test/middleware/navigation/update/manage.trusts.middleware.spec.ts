jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/utils/application.data');
jest.mock('../../../../src/utils/update/review_trusts');

import { describe, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
import { ROUTE_PARAM_TRUSTEE_ID, SECURE_UPDATE_FILTER_URL } from '../../../../src/config';

import {
  manageTrustsReviewFormerBOsGuard,
  manageTrustsReviewIndividualsGuard,
  manageTrustsReviewLegalEntitiesGuard,
  manageTrustsTellUsAboutFormerBOsGuard,
  manageTrustsTellUsAboutIndividualsGuard,
  manageTrustsTellUsAboutLegalEntitiesGuard,
  reviewTheTrustGuard,
} from '../../../../src/middleware/navigation/update/manage.trusts.middleware';
import { getApplicationData } from '../../../../src/utils/application.data';
import { getTrustInReview, getTrusteeIndex, hasTrusteesToReview, hasTrustsToReview } from "../../../../src/utils/update/review_trusts";
import { TrusteeType } from '../../../../src/model/trustee.type.model';

const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetTrustInReview = getTrustInReview as jest.Mock;
const mockGetTrusteeIndex = getTrusteeIndex as jest.Mock;
const mockHasTrustsToReview = hasTrustsToReview as jest.Mock;
const mockHasTrusteesToReview = hasTrusteesToReview as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

const mockAppData = {
  entity_name: 'manage trust middleware OE',
  entity_number: 'OE199970',
};

const mockTrustInReview = {
  trust_id: 'trust-in-review-1',
  trust_name: 'middleware test trust',
};

const reqParamsWithTrusteeId = {
  [ROUTE_PARAM_TRUSTEE_ID]: 'test-trustee-id',
};

describe("manage trusts middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    req.params = {};
    mockGetApplicationData.mockReset();
    mockGetTrustInReview.mockReset();
    mockGetTrusteeIndex.mockReset();
    mockHasTrusteesToReview.mockReset();
  });

  describe('reviewTheTrustGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await reviewTheTrustGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when there are trusts to review, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockHasTrustsToReview.mockReturnValueOnce(true);

      await reviewTheTrustGuard(req, res, next);

      expectToGoToNextMiddleware();
    });

    test('when there are no trusts to review, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockHasTrustsToReview.mockReturnValueOnce(false);

      await reviewTheTrustGuard(req, res, next);

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });

  describe('manageTrustsReviewFormerBOsGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await manageTrustsReviewFormerBOsGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when a trust has former trustees to review, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      mockHasTrusteesToReview.mockReturnValueOnce(true);

      await manageTrustsReviewFormerBOsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockHasTrusteesToReview).toHaveBeenCalledWith(mockTrustInReview, TrusteeType.HISTORICAL);
      expect(mockHasTrusteesToReview).toHaveBeenCalledTimes(1);

      expectToGoToNextMiddleware();
    });

    test('when a trust has no former trustees to review, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      mockHasTrusteesToReview.mockReturnValueOnce(false);

      await manageTrustsReviewFormerBOsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockHasTrusteesToReview).toHaveBeenCalledWith(mockTrustInReview, TrusteeType.HISTORICAL);
      expect(mockHasTrusteesToReview).toHaveBeenCalledTimes(1);

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });

  describe('manageTrustsReviewIndividualsGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await manageTrustsReviewIndividualsGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when a trust has individual trustees to review, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      mockHasTrusteesToReview.mockReturnValueOnce(true);

      await manageTrustsReviewIndividualsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockHasTrusteesToReview).toHaveBeenCalledWith(mockTrustInReview, TrusteeType.INDIVIDUAL);
      expect(mockHasTrusteesToReview).toHaveBeenCalledTimes(1);

      expectToGoToNextMiddleware();
    });

    test('when a trust has no individual trustees to review, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      mockHasTrusteesToReview.mockReturnValueOnce(false);

      await manageTrustsReviewIndividualsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockHasTrusteesToReview).toHaveBeenCalledWith(mockTrustInReview, TrusteeType.INDIVIDUAL);
      expect(mockHasTrusteesToReview).toHaveBeenCalledTimes(1);

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });

  describe('manageTrustsReviewLegalEntitiesGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await manageTrustsReviewLegalEntitiesGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when a trust has legal entity trustees to review, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      mockHasTrusteesToReview.mockReturnValueOnce(true);

      await manageTrustsReviewLegalEntitiesGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockHasTrusteesToReview).toHaveBeenCalledWith(mockTrustInReview, TrusteeType.LEGAL_ENTITY);
      expect(mockHasTrusteesToReview).toHaveBeenCalledTimes(1);

      expectToGoToNextMiddleware();
    });

    test('when a trust has no legal entity trustees to review, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      mockHasTrusteesToReview.mockReturnValueOnce(false);

      await manageTrustsReviewLegalEntitiesGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockHasTrusteesToReview).toHaveBeenCalledWith(mockTrustInReview, TrusteeType.LEGAL_ENTITY);
      expect(mockHasTrusteesToReview).toHaveBeenCalledTimes(1);

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });

  describe('manageTrustsTellUsAboutFormerBOsGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await manageTrustsTellUsAboutFormerBOsGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when there is a trust in review and no trustee id in url, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);

      await manageTrustsTellUsAboutFormerBOsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).not.toHaveBeenCalled();

      expectToGoToNextMiddleware();
    });

    test('when there is a trust in review and a trustee id in url that is not in the model, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      req.params = reqParamsWithTrusteeId;
      mockGetTrusteeIndex.mockReturnValueOnce(-1);

      await manageTrustsTellUsAboutFormerBOsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).toHaveBeenCalledWith(mockTrustInReview, 'test-trustee-id', TrusteeType.HISTORICAL);
      expect(mockGetTrusteeIndex).toHaveBeenCalledTimes(1);

      expectToBeRedirectedToSecureUpdateFilter();
    });

    test('when there is a trust in review and a trustee id in url that is in the model, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      req.params = reqParamsWithTrusteeId;
      mockGetTrusteeIndex.mockReturnValueOnce(0);

      await manageTrustsTellUsAboutFormerBOsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).toHaveBeenCalledWith(mockTrustInReview, 'test-trustee-id', TrusteeType.HISTORICAL);
      expect(mockGetTrusteeIndex).toHaveBeenCalledTimes(1);

      expectToGoToNextMiddleware();
    });

    test('when there is no trust in review, redirects to SECURE_UPDATE_FILTER middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(undefined);

      await manageTrustsTellUsAboutFormerBOsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).not.toHaveBeenCalled();

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });

  describe('manageTrustsTellUsAboutIndividualsGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await manageTrustsTellUsAboutIndividualsGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when there is a trust in review and no trustee id in url, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);

      await manageTrustsTellUsAboutIndividualsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).not.toHaveBeenCalled();

      expectToGoToNextMiddleware();
    });

    test('when there is a trust in review and a trustee id in url that is not in the model, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      req.params = reqParamsWithTrusteeId;
      mockGetTrusteeIndex.mockReturnValueOnce(-1);

      await manageTrustsTellUsAboutIndividualsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).toHaveBeenCalledWith(mockTrustInReview, 'test-trustee-id', TrusteeType.INDIVIDUAL);
      expect(mockGetTrusteeIndex).toHaveBeenCalledTimes(1);

      expectToBeRedirectedToSecureUpdateFilter();
    });

    test('when there is a trust in review and a trustee id in url that is in the model, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      req.params = reqParamsWithTrusteeId;
      mockGetTrusteeIndex.mockReturnValueOnce(0);

      await manageTrustsTellUsAboutIndividualsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).toHaveBeenCalledWith(mockTrustInReview, 'test-trustee-id', TrusteeType.INDIVIDUAL);
      expect(mockGetTrusteeIndex).toHaveBeenCalledTimes(1);

      expectToGoToNextMiddleware();
    });

    test('when there is no trust in review, redirects to SECURE_UPDATE_FILTER middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(undefined);

      await manageTrustsTellUsAboutIndividualsGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).not.toHaveBeenCalled();

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });

  describe('manageTrustsTellUsAboutLegalEntitiesGuard', () => {
    test('when an error is thrown, next is called with the error as an argument', async () => {
      const error = new Error('Error message');
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

      await manageTrustsTellUsAboutLegalEntitiesGuard(req, res, next);

      expectNextToBeCalledWithError(error);
    });

    test('when there is a trust in review and no trustee id in url, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);

      await manageTrustsTellUsAboutLegalEntitiesGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).not.toHaveBeenCalled();

      expectToGoToNextMiddleware();
    });

    test('when there is a trust in review and a trustee id in url that is not in the model, redirects to SECURE_UPDATE_FILTER', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      req.params = reqParamsWithTrusteeId;
      mockGetTrusteeIndex.mockReturnValueOnce(-1);

      await manageTrustsTellUsAboutLegalEntitiesGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).toHaveBeenCalledWith(mockTrustInReview, 'test-trustee-id', TrusteeType.LEGAL_ENTITY);
      expect(mockGetTrusteeIndex).toHaveBeenCalledTimes(1);

      expectToBeRedirectedToSecureUpdateFilter();
    });

    test('when there is a trust in review and a trustee id in url that is in the model, moves to next middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(mockTrustInReview);
      req.params = reqParamsWithTrusteeId;
      mockGetTrusteeIndex.mockReturnValueOnce(0);

      await manageTrustsTellUsAboutLegalEntitiesGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).toHaveBeenCalledWith(mockTrustInReview, 'test-trustee-id', TrusteeType.LEGAL_ENTITY);
      expect(mockGetTrusteeIndex).toHaveBeenCalledTimes(1);

      expectToGoToNextMiddleware();
    });

    test('when there is no trust in review, redirects to SECURE_UPDATE_FILTER middleware', async () => {
      mockGetApplicationData.mockReturnValueOnce(mockAppData);
      mockGetTrustInReview.mockReturnValueOnce(undefined);

      await manageTrustsTellUsAboutLegalEntitiesGuard(req, res, next);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(mockAppData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrusteeIndex).not.toHaveBeenCalled();

      expectToBeRedirectedToSecureUpdateFilter();
    });
  });
});

const expectNextToBeCalledWithError = (error) => {
  expectToGoToNextMiddleware();
  expect(next).toHaveBeenCalledWith(error);
};

const expectToGoToNextMiddleware = () => {
  expect(next).toHaveBeenCalledTimes(1);
  expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
  expect(res.redirect).not.toHaveBeenCalled();
};

const expectToBeRedirectedToSecureUpdateFilter = () => {
  expect(next).not.toHaveBeenCalled();
  expect(mockLoggerInfoRequest).toHaveBeenCalled();
  expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
};
