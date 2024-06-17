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

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import {
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL
} from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { isInChangeJourney } from '../../../src/middleware/navigation/update/is.in.change.journey.middleware';
import { manageTrustsReviewLegalEntitiesGuard } from '../../../src/middleware/navigation/update/manage.trusts.middleware';
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { TRUST } from '../../__mocks__/session.mock';
import { PAGE_NOT_FOUND_TEXT } from '../../__mocks__/text.mock';
import { Trust, yesNoResponse } from '@companieshouse/api-sdk-node/dist/services/overseas-entities';
import { TrustCorporate } from '../../../src/model/trust.model';
import { RoleWithinTrustType } from '../../../src/model/role.within.trust.type.model';
import { ApplicationData } from '../../../src/model';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { getTrustInReview } from '../../../src/utils/update/review_trusts';
import { hasBOsOrMOsUpdate } from '../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware';
import { ErrorMessages } from "../../../src/validation/error.messages";

const defaultLegalEntities = [{
  id: "123",
  type: RoleWithinTrustType.BENEFICIARY,
  name: "Abigail Pruitt",
  date_became_interested_person_day: "5",
  date_became_interested_person_month: "5",
  date_became_interested_person_year: "2023",
  ro_address_premises: "Ariel Lancaster",
  ro_address_line_1: "728 Green Fabien Lane",
  ro_address_line_2: "Culpa eius voluptat",
  ro_address_locality: "Elit quod cupidatat",
  ro_address_region: "Voluptate eveniet f",
  ro_address_country: "Scotland",
  ro_address_postal_code: "58769",
  ro_address_care_of: "",
  ro_address_po_box: "",
  sa_address_care_of: "",
  sa_address_po_box: "",
  identification_legal_authority: "Nesciunt quidem qua",
  identification_legal_form: "Consequuntur tempora",
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  is_on_register_in_country_formed_in: 0,
  sa_address_premises: "",
  sa_address_line_1: "",
  sa_address_line_2: "",
  sa_address_locality: "",
  sa_address_region: "",
  sa_address_country: "",
  sa_address_postal_code: "",
  is_corporate_still_involved_in_trust: "Yes"
} as TrustCorporate,
{
  id: "456",
  type: RoleWithinTrustType.GRANTOR,
  name: "Peter Smyth",
  date_became_interested_person_day: "5",
  date_became_interested_person_month: "5",
  date_became_interested_person_year: "2023",
  ro_address_premises: "Ariel Lancaster",
  ro_address_line_1: "728 Green Fabien Lane",
  ro_address_line_2: "Culpa eius voluptat",
  ro_address_locality: "Elit quod cupidatat",
  ro_address_region: "Voluptate eveniet f",
  ro_address_country: "Scotland",
  ro_address_postal_code: "58769",
  ro_address_care_of: "",
  ro_address_po_box: "",
  sa_address_care_of: "",
  sa_address_po_box: "",
  identification_legal_authority: "Nesciunt quidem qua",
  identification_legal_form: "Consequuntur tempora",
  is_service_address_same_as_principal_address: yesNoResponse.Yes,
  is_on_register_in_country_formed_in: 0,
  sa_address_premises: "",
  sa_address_line_1: "",
  sa_address_line_2: "",
  sa_address_locality: "",
  sa_address_region: "",
  sa_address_country: "",
  sa_address_postal_code: "",
  is_corporate_still_involved_in_trust: "Yes"
} as TrustCorporate];

const getReviewTrust = (corporates) => (
{
  ...TRUST,
  trust_id: "1",
  CORPORATES: corporates,
  review_status: {
    in_review: true,
    reviewed_former_bos: false,
    reviewed_individuals: false,
    reviewed_legal_entities: false,
  }
} as Trust);

const getAppDataWithReviewTrust = (corporates) => ({
  update: { review_trusts: [getReviewTrust(corporates)] },
} as ApplicationData);

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

const mockManageTrustsReviewLegalEntitiesGuard = manageTrustsReviewLegalEntitiesGuard as jest.Mock;
mockManageTrustsReviewLegalEntitiesGuard.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockSetExtraData = setExtraData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockGetTrustInReview = getTrustInReview as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

describe('Update - Manage Trusts - Review legal entities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(getAppDataWithReviewTrust(defaultLegalEntities));
      mockGetTrustInReview.mockReturnValueOnce(getReviewTrust(defaultLegalEntities));

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Review legal entities");

      expect(response.text).toContain("Abigail Pruitt");
      expect(response.text).toContain("Beneficiary");
      expect(response.text).toContain(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL}/123`);

      expect(response.text).toContain("Peter Smyth");
      expect(response.text).toContain("Grantor");
      expect(response.text).toContain(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL}/456`);

      expect(response.text).toContain('Add a legal entity');
      expect(response.text).toContain('No more to add');
    });

    test.each([
      ['there are no legal entities in the trust', []],
      ['the trust legal entities is undefined', undefined],
    ])('when feature flag is on, and %s, an error is thrown', async (_, legalEntities) => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetApplicationData.mockReturnValueOnce(getAppDataWithReviewTrust(legalEntities));
      mockGetTrustInReview.mockReturnValueOnce(getReviewTrust(legalEntities));

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(response.status).toBe(500);
    });

    test.each([
      ['Uppercase', 'BENEFICIARY'],
      ['Camelcase', 'Beneficiary'],
      ['Lowercase', 'beneficiary'],
    ])('when beneficial owner type is %s string then it is mapped correctly on the page', async (_, boType) => {
      // resuming an update journey/application causes the bo types to be set as uppercase strings instead of RoleWithinTrustType
      mockIsActiveFeature.mockReturnValue(true);
      const cloneDefaultLegalEntities = JSON.parse(JSON.stringify(defaultLegalEntities));
      cloneDefaultLegalEntities[0].type = boType as RoleWithinTrustType;

      mockGetApplicationData.mockReturnValueOnce(getAppDataWithReviewTrust(cloneDefaultLegalEntities));
      mockGetTrustInReview.mockReturnValueOnce(getReviewTrust(cloneDefaultLegalEntities));

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(resp.text).toContain('Beneficiary');
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(response.status).toEqual(404);
      expect(response.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when add button clicked, redirect to add legal entity page with no id param', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);

      const response = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL)
        .send({ addLegalEntity: 'addLegalEntity' });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);

      expect(mockSetExtraData).not.toHaveBeenCalled();
    });

    test('when no more add clicked, saves session state and redirects to the orchestrator', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      const appData = { entity_number: 'OE999876', entity_name: 'Test OE' };

      mockGetApplicationData.mockReturnValue(appData);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(resp.status).toEqual(302);
      expect(resp.header.location).toEqual(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);

      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);

      const response = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(response.status).toEqual(404);
      expect(response.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    describe('Still involved and ceased date tests', () => {
      const ceasedDateScenarios = [
        [
          "missing ceased date DAY error message",
          {
            ceasedDateMonth: "11",
            ceasedDateYear: "2021"
          },
          ErrorMessages.DAY_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "missing ceased date MONTH error message",
          {
            ceasedDateDay: "11",
            ceasedDateYear: "2021"
          },
          ErrorMessages.MONTH_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "missing ceased date YEAR error message",
          {
            ceasedDateDay: "11",
            ceasedDateMonth: "5"
          },
          ErrorMessages.YEAR_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "invalid ceased date YEAR length error message",
          {
            ceasedDateDay: "11",
            ceasedDateMonth: "5",
            ceasedDateYear: "21"
          },
          ErrorMessages.YEAR_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "invalid ceased date DAY length error message",
          {
            ceasedDateDay: "111",
            ceasedDateMonth: "5",
            ceasedDateYear: "21"
          },
          ErrorMessages.DAY_LENGTH_OF_LEGAL_ENTITY
        ],
        [
          "invalid ceased date MONTH length error message",
          {
            ceasedDateDay: "11",
            ceasedDateMonth: "544",
            ceasedDateYear: "21"
          },
          ErrorMessages.MONTH_LENGTH_OF_LEGAL_ENTITY
        ],
        [
          "invalid ceased date error message",
          {
            ceasedDateDay: "31",
            ceasedDateMonth: "2",
            ceasedDateYear: "2023"
          },
          ErrorMessages.INVALID_DATE_OF_LEGAL_ENTITY
        ],
        [
          "future ceased date error message",
          {
            ceasedDateDay: "11",
            ceasedDateMonth: "2",
            ceasedDateYear: "9024"
          },
          ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "day and month ceased date missing error message",
          {
            ceasedDateYear: "2023"
          },
          ErrorMessages.DAY_AND_MONTH_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "month and year ceased date missing error message",
          {
            ceasedDateDay: "23"
          },
          ErrorMessages.MONTH_AND_YEAR_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "day and year ceased date missing error message",
          {
            ceasedDateMonth: "11"
          },
          ErrorMessages.DAY_AND_YEAR_OF_CEASED_LEGAL_ENTITY
        ],
        [
          "ceased date must not be before creation date error message",
          {
            createdDateDay: "11",
            createdDateMonth: "2",
            createdDateYear: "2000",
            ceasedDateDay: "10",
            ceasedDateMonth: "2",
            ceasedDateYear: "2000"
          },
          ErrorMessages.LEGAL_ENTITY_CEASED_DATE_BEFORE_CREATED_DATE
        ]
      ];

      test.only(`renders the update-manage-trusts-tell-us-about-the-individual page with missing ceased date error message when legal entity is no longer involved but date not entered`, async () => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        const response = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL)
        .send({ stillInvolved: "0" });
        expect(response.status).toEqual(200);
        expect(response.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      });

      test.each(ceasedDateScenarios)(`renders the update-manage-trusts-tell-us-about-the-individual page when %s`, async (_, formData, errorMessage) => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        const response = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL)
        .send({ ...formData, stillInvolved: "0" });
        expect(response.status).toEqual(200);
        expect(response.header.location).toEqual(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
      });
    });
  });
});
