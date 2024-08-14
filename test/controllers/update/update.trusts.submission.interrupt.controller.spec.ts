jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/utils/trusts');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/middleware/navigation/check.condition');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_CHECK_YOUR_ANSWERS_URL,
  UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL,
  UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL,
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { checkUpdatePresenterEntered } from '../../../src/middleware/navigation/check.condition';
import { getApplicationData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { APPLICATION_DATA_MOCK } from '../../__mocks__/session.mock';
import { PAGE_TITLE_ERROR, CONTINUE_BUTTON_TEXT } from '../../__mocks__/text.mock';
import { ApplicationData } from '../../../src/model';
import { checkEntityRequiresTrusts } from '../../../src/utils/trusts';

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockCheckEntityRequiresTrusts = checkEntityRequiresTrusts as jest.Mock;
mockCheckEntityRequiresTrusts.mockReturnValue(false);

const mockCheckUpdatePresenterEntered = checkUpdatePresenterEntered as jest.Mock;
mockCheckUpdatePresenterEntered.mockImplementation((_: ApplicationData) => true );

describe('Update - Trusts - Submission Interrupt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when there are BOs with Trustee NOCs, page is returned', async () => {
      mockCheckEntityRequiresTrusts.mockReturnValue(true);
      const resp = await request(app).get(UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('You now need to submit trust information');
      expect(resp.text).toContain(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when there are no BOs with Trustee NOCs, redirect to check your answers', async () => {
      mockCheckEntityRequiresTrusts.mockReturnValue(false);

      const resp = await request(app).get(UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_CHECK_YOUR_ANSWERS_URL);
    });
  });

  describe('POST tests', () => {
    test('redirects to tell us about the trust page', async () => {
      const resp = await request(app).post(UPDATE_TRUSTS_SUBMISSION_INTERRUPT_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_TRUSTS_TELL_US_ABOUT_IT_URL);
    });
  });
});
