jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/save.and.continue');

import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  TRUST_INVOLVED_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL,
  UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL,
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { APPLICATION_DATA_UPDATE_NO_TRUSTS_MOCK, APPLICATION_DATA_MOCK, APPLICATION_DATA_UPDATE_NO_BO_TRUSTEES_MOCK } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT, UPDATE_TELL_US_ABOUT_TRUST_HEADING, UPDATE_TELL_US_ABOUT_TRUST_QUESTION, ERROR_LIST, TRUST_CEASED_DATE_TEXT, TRUST_NOT_ASSOCIATED_WITH_BENEFICIAL_OWNER_TEXT } from '../../__mocks__/text.mock';
import { saveAndContinueButtonText } from '../../__mocks__/save.and.continue.mock';
import { saveAndContinue } from '../../../src/utils/save.and.continue';

const mockGetApplicationData = getApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Update - Trusts - Tell us about the trust', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, and there are trusts page is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_MOCK } );
      const resp = await request(app).get(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_HEADING);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_QUESTION);
      expect(resp.text).toContain(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is on, and there are no trusts page is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_UPDATE_NO_TRUSTS_MOCK } );
      const resp = await request(app).get(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);
      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_HEADING);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_QUESTION);
      expect(resp.text).toContain(UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when trusts ceased date feature flag is on and no associated BOs, ceased date should not be shown as page is not in review mode', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_MANAGE_TRUSTS
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_TRUSTS_CEASED_DATE
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_UPDATE_NO_BO_TRUSTEES_MOCK } );

      const resp = await request(app).get(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_HEADING);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_QUESTION);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(TRUST_NOT_ASSOCIATED_WITH_BENEFICIAL_OWNER_TEXT);
      expect(resp.text).not.toContain(TRUST_CEASED_DATE_TEXT);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app).get(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when feature flag is on and no data posted, re-render page with validation error', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_MOCK } );
      const resp = await request(app).post(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL).send({});

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ERROR_LIST);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_HEADING);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_TRUST_QUESTION);
    });

    test('when feature flag is on and posting valid data, redirect to update-trusts-individuals-or-entities-involved page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue( { ...APPLICATION_DATA_MOCK } );
      const resp = await request(app).post(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL).send({
        name: 'Trust name',
        createdDateDay: '8',
        createdDateMonth: '7',
        createdDateYear: '2023',
        beneficialOwnersIds: '45e4283c-6b05-42da-ac9d-1f7bf9fe9c85',
        hasAllInfo: '0',
        trustId: ''
      });

      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL + "/2" + TRUST_INVOLVED_URL);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const resp = await request(app).post(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});
