jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag' );
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/service/overseas.entities.service');

import { NextFunction } from 'express';
import request from 'supertest';

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import app from '../../../src/app';

import { UpdateKey } from "../../../src/model/update.type.model";
import { ErrorMessages } from '../../../src/validation/error.messages';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';

import { getApplicationData, fetchApplicationData } from '../../../src/utils/application.data';

import {
  PAGE_TITLE_ERROR,
  RELEVANT_PERIOD_EXTRA_INFO_REQUIRED
} from '../../__mocks__/text.mock';

import {
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
} from '../../../src/config';

import {
  OVERSEAS_ENTITY_ID,
  APPLICATION_DATA_MOCK,
  UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE,
} from '../../__mocks__/session.mock';

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;
mockUpdateOverseasEntity.mockReturnValue(OVERSEAS_ENTITY_ID);

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Update - Manage Trusts - Individuals or entities involved', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe('GET tests', () => {

    test('when feature flag is on, page is returned with reviewed and added tables', async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Individuals or entities involved in the trust");
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);
      expect(resp.text).not.toContain(RELEVANT_PERIOD_EXTRA_INFO_REQUIRED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when relevant period changes are selected in the application data extra relevant period section is rendered on page', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      const appData = APPLICATION_DATA_MOCK;
      appData[UpdateKey] = UPDATE_OBJECT_MOCK_RELEVANT_PERIOD_CHANGE;

      mockGetApplicationData.mockReturnValueOnce(appData);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain("Individuals or entities involved in the trust");
      expect(resp.text).toContain(RELEVANT_PERIOD_EXTRA_INFO_REQUIRED);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });
  });

  describe('POST tests', () => {

    test('when feature flag is on, redirect to orchestrator', async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL).send({ noMoreToAdd: 'noMoreToAdd' });

      expect(resp.status).toEqual(302);
      expect(updateOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL);
    });

    test("trigger validation when no radio button selected", async () => {
      mockIsActiveFeature.mockReturnValue(true);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain(ErrorMessages.TRUST_INVOLVED_INVALID);
    });
  });
});
