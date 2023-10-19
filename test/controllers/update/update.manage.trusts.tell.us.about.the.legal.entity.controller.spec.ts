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

import { beforeEach, jest, test, describe } from '@jest/globals';
import request from 'supertest';
import { NextFunction } from 'express';

import app from '../../../src/app';
import { UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL, UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { isActiveFeature } from '../../../src/utils/feature.flag';

import { TRUST } from '../../__mocks__/session.mock';
import { ANY_MESSAGE_ERROR, CONTINUE_BUTTON_TEXT, PAGE_NOT_FOUND_TEXT, PAGE_TITLE_ERROR, SERVICE_UNAVAILABLE, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_TITLE } from '../../__mocks__/text.mock';
import { UpdateKey } from '../../../src/model/update.type.model';
import { Trust, TrustCorporate } from '../../../src/model/trust.model';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { ApplicationData } from '../../../src/model';
import { RoleWithinTrustType } from '../../../src/model/role.within.trust.type.model';
import { manageTrustsTellUsAboutLegalEntitiesGuard } from '../../../src/middleware/navigation/update/manage.trusts.middleware';
import { hasBOsOrMOsUpdate } from '../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware';
import { isInChangeJourney } from '../../../src/middleware/navigation/update/is.in.change.journey.middleware';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../../src/utils/update/review_trusts';
import { TrusteeType } from '../../../src/model/trustee.type.model';
import { saveAndContinue } from '../../../src/utils/save.and.continue';

const mockAuthenticationMiddleware = authentication as jest.Mock;
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockCompanyAuthenticationMiddleware = companyAuthentication as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

const mockHasBOsOrMOsUpdate = hasBOsOrMOsUpdate as jest.Mock;
mockHasBOsOrMOsUpdate.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockManageTrustsTellUsAboutLegalEntitiesGuard = manageTrustsTellUsAboutLegalEntitiesGuard as jest.Mock;
mockManageTrustsTellUsAboutLegalEntitiesGuard.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsInChangeJourney = isInChangeJourney as jest.Mock;
mockIsInChangeJourney.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockGetTrustInReview = getTrustInReview as jest.Mock;
const mockGetTrusteeIndex = getTrusteeIndex as jest.Mock;
const mockGetTrustee = getTrustee as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

const legal_entity_trustee = {
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
  sa_address_postal_code: ""
} as TrustCorporate;

const legal_entity_trustee_2 = {
  id: "456",
  type: RoleWithinTrustType.BENEFICIARY,
  name: "Peter Pruitt",
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
  sa_address_postal_code: ""
} as TrustCorporate;

const mockGetApplicationData = getApplicationData as jest.Mock;
mockGetApplicationData.mockReturnValue({
  [UpdateKey]: {
    review_trusts: [
      {
        ...TRUST,
        trust_id: "1",
        CORPORATE: [
          legal_entity_trustee,
          legal_entity_trustee_2,
        ],
        review_status: {
          in_review: true,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
          reviewed_trust_details: false,
        }
      } as Trust
    ]
  }
} as ApplicationData);

describe('Update - Manage Trusts - Review legal entities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when feature flag is on, page is returned for adding new legal entity', async () => {
      const appData = { entity_number: 'OE123456', entity_name: 'Test OE' };
      const trustInReview = { trust_id: '1199', trust_name: 'Trust 1', review_status: { in_review: true } };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrustee.mockReturnValue(undefined);

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_TITLE);
      expect(response.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(appData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrustee).toHaveBeenCalledTimes(1);

      expect(response.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(response.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when there is a legal entity to display, the page is rendered with fields populated', async () => {
      const appData = { entity_number: 'OE123456', entity_name: 'Test OE' };
      const trustInReview = { trust_id: '1199', trust_name: 'Trust 1', review_status: { in_review: true } };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrustee.mockReturnValue(legal_entity_trustee);

      const response = await request(app).get(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL}/123`);

      expect(response.status).toEqual(200);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(appData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrustee).toHaveBeenCalledWith(trustInReview, '123', TrusteeType.LEGAL_ENTITY);
      expect(mockGetTrustee).toHaveBeenCalledTimes(1);

      expect(response.text).toContain('Trust 1');
      expect(response.text).toContain('Tell us about the legal entity');
      expect(response.text).toContain('Abigail');
      expect(response.text).toContain('Pruitt');
      expect(response.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(response.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(response.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);

      expect(response.status).toEqual(404);
      expect(response.text).toContain(PAGE_NOT_FOUND_TEXT);
    });

    test("catch error when rendering the page", async () => {
      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });

      const response = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain(SERVICE_UNAVAILABLE);
    });
  });

  describe('POST tests', () => {
    test('when a valid trustee submission is provided, and the trustee id is of an existing trust, the trust is updated in the model', async () => {
      const formSubmission = {
        legalEntityId: 'trustee-id-2',
        legalEntityName: 'Legal Trust',
        roleWithinTrust: RoleWithinTrustType.GRANTOR,
        interestedPersonStartDateDay: '01',
        interestedPersonStartDateMonth: '02',
        interestedPersonStartDateYear: '2022',
        principal_address_property_name_number: 'Principal 1',
        principal_address_line_1: 'Principal New Line 1',
        principal_address_line_2: 'Principal New Line 2',
        principal_address_town: 'Principal New Town',
        principal_address_county: 'Principal New County',
        principal_address_country: 'Principal New Country',
        principal_address_postcode: 'RO NE994WS',
        service_address_property_name_number: 'Service 1',
        service_address_line_1: 'Service New Line 1',
        service_address_line_2: 'Service New Line 2',
        service_address_town: 'Service New Town',
        service_address_county: 'Service New County',
        service_address_country: 'Service New Country',
        service_address_postcode: 'Service NE994WS',
        governingLaw: 'Governing Law',
        legalForm: 'Legal form',
        public_register_name: 'Public register name',
        public_register_jurisdiction: 'Public register jurisdiction',
        registration_number: '0123449EDCA',
        is_service_address_same_as_principal_address: yesNoResponse.No,
        is_on_register_in_country_formed_in: yesNoResponse.Yes,
      };

      const expectedTrustee = {
        id: 'trustee-id-2',
        name: 'Legal Trust',
        type: RoleWithinTrustType.GRANTOR,
        date_became_interested_person_day: '01',
        date_became_interested_person_month: '02',
        date_became_interested_person_year: '2022',
        ro_address_premises: 'Principal 1',
        ro_address_line_1: 'Principal New Line 1',
        ro_address_line_2: 'Principal New Line 2',
        ro_address_locality: 'Principal New Town',
        ro_address_region: 'Principal New County',
        ro_address_country: 'Principal New Country',
        ro_address_postal_code: 'RO NE994WS',
        ro_address_care_of: '',
        ro_address_po_box: '',
        sa_address_premises: 'Service 1',
        sa_address_line_1: 'Service New Line 1',
        sa_address_line_2: 'Service New Line 2',
        sa_address_locality: 'Service New Town',
        sa_address_region: 'Service New County',
        sa_address_country: 'Service New Country',
        sa_address_postal_code: 'Service NE994WS',
        sa_address_care_of: '',
        sa_address_po_box: '',
        identification_legal_authority: 'Governing Law',
        identification_legal_form: 'Legal form',
        identification_place_registered: 'Public register name',
        identification_country_registration: 'Public register jurisdiction',
        identification_registration_number: '0123449EDCA',
        is_service_address_same_as_principal_address: yesNoResponse.No,
        is_on_register_in_country_formed_in: yesNoResponse.Yes,
      };

      const trustInReview = {
        trust_id: 'trust-1',
        review_status: { in_review: true },
        CORPORATES: [{
          id: 'trustee-id-2',
          name: 'Existing Legal Trust',
          type: RoleWithinTrustType.GRANTOR,
          date_became_interested_person_day: '04',
          date_became_interested_person_month: '03',
          date_became_interested_person_year: '2001',
          ro_address_premises: 'Existing Principal 1',
          ro_address_line_1: 'Existing Principal New Line 1',
          ro_address_line_2: 'Existing Principal New Line 2',
          ro_address_locality: 'Existing Principal New Town',
          ro_address_region: 'Existing Principal New County',
          ro_address_country: 'Existing Principal New Country',
          ro_address_postal_code: 'RO NE994W',
          ro_address_care_of: '',
          ro_address_po_box: '',
          sa_address_premises: '',
          sa_address_line_1: '',
          sa_address_line_2: '',
          sa_address_locality: '',
          sa_address_region: '',
          sa_address_country: '',
          sa_address_postal_code: '',
          sa_address_care_of: '',
          sa_address_po_box: '',
          identification_legal_authority: 'Existing Governing Law',
          identification_legal_form: 'Existing Legal form',
          identification_place_registered: '',
          identification_country_registration: '',
          identification_registration_number: '',
          is_service_address_same_as_principal_address: yesNoResponse.Yes,
          is_on_register_in_country_formed_in: yesNoResponse.No,
        }]
      };

      const appData = {
        entity_number: 'OE988669',
        entity_name: 'Tell us about the legal entity OE 1',
        update: { review_trusts: [trustInReview] }
      };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrusteeIndex.mockReturnValue(0);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL)
        .send({
          ...formSubmission,
        });

      expect(resp.status).toBe(302);
      expect(resp.header.location).toBe(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(appData.update.review_trusts[0].CORPORATES[0]).toEqual(expectedTrustee);

      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test('when a valid trust submission is provided, and the trust id is not an existing trust, the trust is added to the model', async () => {
      const formSubmission = {
        legalEntityId: 'trustee-id-2',
        legalEntityName: 'Legal Trust',
        roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
        interestedPersonStartDateDay: '01',
        interestedPersonStartDateMonth: '02',
        interestedPersonStartDateYear: '2022',
        principal_address_property_name_number: 'Principal 1',
        principal_address_line_1: 'Principal New Line 1',
        principal_address_line_2: 'Principal New Line 2',
        principal_address_town: 'Principal New Town',
        principal_address_county: 'Principal New County',
        principal_address_country: 'Principal New Country',
        principal_address_postcode: 'RO NE994WS',
        service_address_property_name_number: 'Principal 1',
        service_address_line_1: 'Principal New Line 1',
        service_address_line_2: 'Principal New Line 2',
        service_address_town: 'Principal New Town',
        service_address_county: 'Principal New County',
        service_address_country: 'Principal New Country',
        service_address_postcode: 'RO NE994WS',
        governingLaw: 'Governing Law',
        legalForm: 'Legal form',
        public_register_name: '',
        public_register_jurisdiction: '',
        registration_number: '',
        is_service_address_same_as_principal_address: yesNoResponse.Yes,
        is_on_register_in_country_formed_in: yesNoResponse.No,
      };

      const expectedTrustee = {
        id: 'trustee-id-2',
        name: 'Legal Trust',
        type: RoleWithinTrustType.BENEFICIARY,
        date_became_interested_person_day: '01',
        date_became_interested_person_month: '02',
        date_became_interested_person_year: '2022',
        ro_address_premises: 'Principal 1',
        ro_address_line_1: 'Principal New Line 1',
        ro_address_line_2: 'Principal New Line 2',
        ro_address_locality: 'Principal New Town',
        ro_address_region: 'Principal New County',
        ro_address_country: 'Principal New Country',
        ro_address_postal_code: 'RO NE994WS',
        ro_address_care_of: '',
        ro_address_po_box: '',
        sa_address_premises: '',
        sa_address_line_1: '',
        sa_address_line_2: '',
        sa_address_locality: '',
        sa_address_region: '',
        sa_address_country: '',
        sa_address_postal_code: '',
        sa_address_care_of: '',
        sa_address_po_box: '',
        identification_legal_authority: 'Governing Law',
        identification_legal_form: 'Legal form',
        is_service_address_same_as_principal_address: yesNoResponse.Yes,
        is_on_register_in_country_formed_in: yesNoResponse.No,
      };

      const existingTrustee = {
        id: 'trustee-id-2',
        name: 'Existing Legal Trust',
        type: RoleWithinTrustType.GRANTOR,
        date_became_interested_person_day: '04',
        date_became_interested_person_month: '03',
        date_became_interested_person_year: '2001',
        ro_address_premises: 'Existing Principal 1',
        ro_address_line_1: 'Existing Principal New Line 1',
        ro_address_line_2: 'Existing Principal New Line 2',
        ro_address_locality: 'Existing Principal New Town',
        ro_address_region: 'Existing Principal New County',
        ro_address_country: 'Existing Principal New Country',
        ro_address_postal_code: 'RO NE994W',
        ro_address_care_of: '',
        ro_address_po_box: '',
        sa_address_premises: 'Existing Service 1',
        sa_address_line_1: 'Existing Service New Line 1',
        sa_address_line_2: 'Existing Service New Line 2',
        sa_address_locality: 'Existing Service New Town',
        sa_address_region: 'Existing Service New County',
        sa_address_country: 'Existing Service New Country',
        sa_address_postal_code: 'SA NE994W',
        sa_address_care_of: '',
        sa_address_po_box: '',
        identification_legal_authority: 'Existing Governing Law',
        identification_legal_form: 'Existing Legal form',
        identification_place_registered: 'Existing register name',
        identification_country_registration: 'Existing register jurisdiction',
        identification_registration_number: 'Existing 12345CDE',
        is_service_address_same_as_principal_address: yesNoResponse.Yes,
        is_on_register_in_country_formed_in: yesNoResponse.No,
      };

      const trustInReview = {
        trust_id: 'trust-1',
        review_status: { in_review: true },
        CORPORATES: [existingTrustee]
      };

      const appData = {
        entity_number: 'OE988669',
        entity_name: 'Tell us about the legal entity OE 1',
        update: { review_trusts: [trustInReview] }
      };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrusteeIndex.mockReturnValue(-1);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL)
        .send({
          ...formSubmission,
        });

      expect(resp.status).toBe(302);
      expect(resp.header.location).toBe(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(appData.update.review_trusts[0].CORPORATES[0]).toEqual(existingTrustee);
      expect(appData.update.review_trusts[0].CORPORATES[1]).toEqual(expectedTrustee);

      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});
