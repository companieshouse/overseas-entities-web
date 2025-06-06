jest.mock('ioredis');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/utils/application.data');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock("../../../src/utils/url");

import request from 'supertest';
import { NextFunction } from 'express';

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import app from '../../../src/app';

import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { stringCount } from '../../utils/test.utils';
import { ADD_TRUST_TEXTS } from "../../../src/utils/add.trust";
import { isRegistrationJourney } from "../../../src/utils/url";

import { fetchApplicationData, getApplicationData } from '../../../src/utils/application.data';
import { Trust, TrustKey } from '../../../src/model/trust.model';
import { APPLICATION_DATA_MOCK, TRUST } from '../../__mocks__/session.mock';

import {
  beneficialOwnerIndividualType,
  beneficialOwnerOtherType
} from "../../../src/model";

import {
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE,
  UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
} from '../../../src/config';

import {
  PAGE_TITLE_ERROR,
  UPDATE_TRUSTS_ASSOCIATED_ADDED_HEADING,
  UPDATE_MANAGE_TRUSTS_REVIEWED_HEADING,
  SAVE_AND_CONTINUE_BUTTON_TEXT
} from '../../__mocks__/text.mock';

mockCsrfProtectionMiddleware.mockClear();
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(false);

describe('Update - Trusts - Trusts associated with the overseas entity', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
  });

  describe('GET tests', () => {

    test.each([
      [
        "are BOs eligible for trusts",
        "with",
        { ...APPLICATION_DATA_MOCK },
        true
      ],
      [
        "are no BOs eligible for trusts",
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
      mockGetApplicationData.mockReturnValue(appData);
      mockFetchApplicationData.mockReturnValue(appData);

      const resp = await request(app).get(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Trusts associated with the overseas entity');
      expect(resp.text).toContain(UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
      expect(resp.text).toContain(SAVE_AND_CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      if (isAddTrustsOptionToBeShown) {
        expect(resp.text).toContain(ADD_TRUST_TEXTS.subtitle);
      } else {
        expect(resp.text).not.toContain(ADD_TRUST_TEXTS.subtitle);
      }
    });

    test('when reviewed and added trusts exist, page is returned with 2 separate summary tables', async () => {
      const mockAppData = {
        ...APPLICATION_DATA_MOCK,
        [TrustKey]: [
          TRUST,
          {
            ...TRUST,
            trust_id: "1",
            ch_reference: "123"
          } as Trust
        ]
      };
      mockIsActiveFeature.mockReturnValue(true);
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockGetApplicationData.mockReturnValue(mockAppData);

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

    test('Reviewed trust status will be shown in summary table', async () => {
      const mockAppData = {
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
      };
      mockIsActiveFeature.mockReturnValue(true);
      // trust with ch_references indicates a reviewable trust (ie it would be an existing trust that has come from chips)
      mockGetApplicationData.mockReturnValue(mockAppData);
      mockFetchApplicationData.mockReturnValue(mockAppData);

      const resp = await request(app).get(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);

      expect(resp.status).toEqual(200);
      expect(resp.text).toContain('Trusts associated with the overseas entity');
      expect(resp.text).toContain(UPDATE_TRUSTS_ASSOCIATED_ADDED_HEADING);
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEWED_HEADING);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(stringCount("Removed", resp.text)).toEqual(1);
      expect(stringCount("Active", resp.text)).toEqual(2);
    });
  });

  describe('POST tests', () => {

    test('when no trusts are to be added, redirect to check your answers page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_UPDATE_TRUSTS
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: '0' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test('when statement validation flag is on, and no trusts are to be added, redirect to beneficial owner statements page', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: '0' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_BENEFICIAL_OWNER_STATEMENTS_URL);
    });

    test('when trusts are to be added, redirect to add trust page', async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      const resp = await request(app).post(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL).send({ addTrust: 'addTrustYes' });
      expect(resp.status).toEqual(302);
      expect(resp.header.location).toContain(UPDATE_TRUSTS_TELL_US_ABOUT_IT_PAGE);
    });
  });
});
