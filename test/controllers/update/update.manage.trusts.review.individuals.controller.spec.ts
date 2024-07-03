jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/update/review_trusts');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/update/is.in.change.journey.middleware');
jest.mock('../../../src/middleware/navigation/update/manage.trusts.middleware');
jest.mock('../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware');

// import remove journey middleware mock before app to prevent real function being used instead of mock
import mockRemoveJourneyMiddleware from "../../__mocks__/remove.journey.middleware.mock";
import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import { UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL, UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL, UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { isInChangeJourney } from '../../../src/middleware/navigation/update/is.in.change.journey.middleware';
import { hasBOsOrMOsUpdate } from '../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware';
import { manageTrustsReviewIndividualsGuard } from '../../../src/middleware/navigation/update/manage.trusts.middleware';
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { getTrustInReview, setTrusteesAsReviewed } from '../../../src/utils/update/review_trusts';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { RoleWithinTrustType } from '../../../src/model/role.within.trust.type.model';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT } from '../../__mocks__/text.mock';
import { TrusteeType } from '../../../src/model/trustee.type.model';
import { saveAndContinue } from '../../../src/utils/save.and.continue';

mockRemoveJourneyMiddleware.mockClear();
mockCsrfProtectionMiddleware.mockClear();
const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsInChangeJourney = isInChangeJourney as jest.Mock;
mockIsInChangeJourney.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockHasBOsOrMOsUpdate = hasBOsOrMOsUpdate as jest.Mock;
mockHasBOsOrMOsUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockManageTrustsReviewIndividualsGuard = manageTrustsReviewIndividualsGuard as jest.Mock;
mockManageTrustsReviewIndividualsGuard.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetTrustInReview = getTrustInReview as jest.Mock;
const mockSetTrusteesAsReviewed = setTrusteesAsReviewed as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const individuals = [{
  forename: 'Dermott',
  surname: 'Jones',
  id: 'dermott-jones-1',
  type: RoleWithinTrustType.GRANTOR,
}, {
  forename: 'Tom',
  surname: 'OLeary',
  id: 'tom-oleary-1',
  type: RoleWithinTrustType.SETTLOR,
}];

const createTrusts = (inReview = true) => {
  return [{
    trust_id: 'test-trust-1',
    INDIVIDUALS: individuals,
    review_status: {
      in_review: inReview,
      reviewed_individuals: false,
    },
  }];
};

describe('Update - Manage Trusts - Review individuals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned displaying individuals from the trust in review', async () => {
      const trusts = createTrusts();
      const trustInReview = trusts[0];
      const appData = { update: { review_trusts: trusts } };

      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetTrustInReview.mockReturnValueOnce(trustInReview);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.status).toEqual(200);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(appData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);

      expect(resp.text).toContain("Review individuals");
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);

      expect(resp.text).toContain('Dermott Jones');
      expect(resp.text).toContain('Grantor');
      expect(resp.text).toContain('Change');
      expect(resp.text).toContain(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL}/dermott-jones-1`);

      expect(resp.text).toContain('Tom OLeary');
      expect(resp.text).toContain('Settlor');
      expect(resp.text).toContain('Change');
      expect(resp.text).toContain(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL}/tom-oleary-1`);

      expect(resp.text).toContain('Add an individual');
      expect(resp.text).toContain('No more to add');
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test.each([
      ['Uppercase', 'BENEFICIARY'],
      ['Camelcase', 'Beneficiary'],
      ['Lowercase', 'beneficiary'],
    ])('when beneficial owner type is %s string then it is mapped correctly on the page', async (_, boType) => {
      // resuming an update journey/application causes the bo types to be set as uppercase strings instead of RoleWithinTrustType
      const trusts = createTrusts();
      const trustInReview = trusts[0];

      trustInReview.INDIVIDUALS[0].type = boType as RoleWithinTrustType;
      const appData = { update: { review_trusts: trusts } };

      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetTrustInReview.mockReturnValueOnce(trustInReview);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.text).toContain('Beneficiary');
    });

    test('Page displays status as active when entity is still involved in the trust', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const individualTrustee = [{
        ...individuals[0],
        still_involved: "Yes"
      }];

      const trusts = [{
        trust_id: 'test-trust-1',
        INDIVIDUALS: individualTrustee,
        review_status: {
          in_review: true,
          reviewed_individuals: false,
        }
      }];

      const appData = { update: { review_trusts: trusts } };

      const trustInReview = {
        ...trusts[0],
      };

      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetTrustInReview.mockReturnValueOnce(trustInReview);

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
      expect(response.text).toContain('Add an individual');
      expect(response.text).toContain('Status');
      expect(response.text).toContain('Active');
    });

    test('Page displays status as removed when entity is not still involved in the trust', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const individualTrustee = [{
        ...individuals[0],
        still_involved: "No"
      }];

      const trusts = [{
        trust_id: 'test-trust-1',
        INDIVIDUALS: individualTrustee,
        review_status: {
          in_review: true,
          reviewed_individuals: false,
        }
      }];

      const appData = { update: { review_trusts: trusts } };

      const trustInReview = {
        ...trusts[0],
      };

      mockGetApplicationData.mockReturnValueOnce(appData);
      mockGetTrustInReview.mockReturnValueOnce(trustInReview);

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
      expect(response.text).toContain('Add an individual');
      expect(response.text).toContain('Status');
      expect(response.text).toContain('Removed');
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when req body contains addIndividual (add button has been clicked), redirects to tell us about the individual with no id param', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL)
        .send({ addIndividual: 'addIndividual' });

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL);

      expect(mockSetExtraData).not.toHaveBeenCalled();
      expect(mockSetTrusteesAsReviewed).not.toHaveBeenCalled();
    });

    test('when req body does not contain addIndividual, saves session state and redirects to the orchestrator', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      const appData = { entity_number: 'OE999876', entity_name: 'Test OE' };

      mockGetApplicationData.mockReturnValueOnce(appData);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);

      expect(mockSetTrusteesAsReviewed).toHaveBeenCalledWith(appData, TrusteeType.INDIVIDUAL);
      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});
