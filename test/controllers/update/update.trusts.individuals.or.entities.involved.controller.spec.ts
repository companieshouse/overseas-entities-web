jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL,
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { APPLICATION_DATA_MOCK } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT } from '../../__mocks__/text.mock';
import { saveAndContinueButtonText } from '../../__mocks__/save.and.continue.mock';

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

describe('Update - Trusts - Individuals or entities involved', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Individuals or entities involved in the trust');
      expect(resp.text).toContain(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);
      expect(resp.text).toContain(saveAndContinueButtonText);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when feature flag is on, redirect to trusts associated with the entity page', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});
