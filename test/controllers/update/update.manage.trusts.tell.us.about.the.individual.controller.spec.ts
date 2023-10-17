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
import { UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL, UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL } from '../../../src/config';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { isInChangeJourney } from '../../../src/middleware/navigation/update/is.in.change.journey.middleware';
import { hasBOsOrMOsUpdate } from '../../../src/middleware/navigation/update/has.beneficial.owners.or.managing.officers.update.middleware';
import { manageTrustsTellUsAboutIndividualsGuard } from '../../../src/middleware/navigation/update/manage.trusts.middleware';
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { getTrustInReview, getTrustee, getTrusteeIndex } from '../../../src/utils/update/review_trusts';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { PAGE_TITLE_ERROR, PAGE_NOT_FOUND_TEXT, CONTINUE_BUTTON_TEXT } from '../../__mocks__/text.mock';
import { TrusteeType } from '../../../src/model/trustee.type.model';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { RoleWithinTrustType } from '../../../src/model/role.within.trust.type.model';

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

const mockManageTrustsTellUsAboutIndividualsGuard = manageTrustsTellUsAboutIndividualsGuard as jest.Mock;
mockManageTrustsTellUsAboutIndividualsGuard.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetTrustInReview = getTrustInReview as jest.Mock;
const mockGetTrustee = getTrustee as jest.Mock;
const mockGetTrusteeIndex = getTrusteeIndex as jest.Mock;
const mockSetExtraData = setExtraData as jest.Mock;
const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Update - Manage Trusts - Review individuals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET tests', () => {
    test('when no trustee to display, still renders the page', async () => {
      const appData = { entity_number: 'OE988669', entity_name: 'Tell us about the individual OE 1' };
      const trustInReview = { trust_id: 'trust-in-review-1', trust_name: 'Veggie Trust', review_status: { in_review: true } };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrustee.mockReturnValue(undefined);

      const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL}/trustee-individual-1`);

      expect(resp.status).toEqual(200);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(appData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrustee).toHaveBeenCalledWith(trustInReview, 'trustee-individual-1', TrusteeType.INDIVIDUAL);
      expect(mockGetTrustee).toHaveBeenCalledTimes(1);

      expect(resp.text).toContain('Veggie Trust');
      expect(resp.text).toContain('Tell us about the individual');
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when there is a trustee to display, the page is rendered with fields populated', async () => {
      const appData = { entity_number: 'OE988664', entity_name: 'Tell us about the individual OE 2' };
      const trustInReview = { trust_id: 'trust-in-review-2', trust_name: 'Veggie Trust', review_status: { in_review: true } };
      const trustee = {
        id: 'trustee-individual-2',
        ch_references: 'trustee-ch-references',
        forename: 'Jack',
        other_forenames: '',
        surname: 'Frost',
        dob_day: '01',
        dob_month: '02',
        dob_year: '1990',
        nationality: 'Chadian',
        second_nationality: 'Afghan',
        ura_address_premises: 'URA Premises',
        ura_address_line_1: 'URA Line 1',
        ura_address_line_2: 'URA Line 2',
        ura_address_locality: 'URA Locality',
        ura_address_region: 'URA Region',
        ura_address_country: 'URA Country',
        ura_address_postal_code: 'UR34 3AA',
        ura_address_care_of: 'URA Care of',
        ura_address_po_box: 'URA Po Box 34',
        sa_address_premises: 'SA Premises',
        sa_address_line_1: 'SA Line 1',
        sa_address_line_2: 'SA Line 2',
        sa_address_locality: 'SA Locality',
        sa_address_region: 'SA Region',
        sa_address_country: 'SA Country',
        sa_address_postal_code: 'SA4 3AA',
        sa_address_care_of: 'SA Care of',
        sa_address_po_box: 'SA Po Box 34',
        type: RoleWithinTrustType.INTERESTED_PERSON,
        date_became_interested_person_day: '01',
        date_became_interested_person_month: '03',
        date_became_interested_person_year: '2020',
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
      };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrustee.mockReturnValue(trustee);

      const resp = await request(app).get(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL}/trustee-individual-2`);

      expect(resp.status).toEqual(200);

      expect(mockGetTrustInReview).toHaveBeenCalledWith(appData);
      expect(mockGetTrustInReview).toHaveBeenCalledTimes(1);
      expect(mockGetTrustee).toHaveBeenCalledWith(trustInReview, 'trustee-individual-2', TrusteeType.INDIVIDUAL);
      expect(mockGetTrustee).toHaveBeenCalledTimes(1);

      expect(resp.text).toContain('Veggie Trust');
      expect(resp.text).toContain('Tell us about the individual');
      expect(resp.text).toContain('Jack');
      expect(resp.text).toContain('Frost');
      expect(resp.text).toContain('URA Locality');
      expect(resp.text).toContain('name="dateBecameIPDay" type="text" value="01"');
      expect(resp.text).toContain('name="dateBecameIPMonth" type="text" value="03"');
      expect(resp.text).toContain('name="dateBecameIPYear" type="text" value="2020"');
      expect(resp.text).toContain(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(resp.text).toContain(CONTINUE_BUTTON_TEXT);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).get(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });

  describe('POST tests', () => {
    test('when a valid trust submission is provided, and the trust id is of an existing trust, the trust is updated in the model', async () => {
      const formSubmission = {
        trusteeId: 'trustee-id-2',
        roleWithinTrust: RoleWithinTrustType.GRANTOR,
        forename: 'Trust',
        surname: 'Ee',
        dateOfBirthDay: '01',
        dateOfBirthMonth: '02',
        dateOfBirthYear: '2022',
        nationality: 'Afghan',
        second_nationality: 'English',
        usual_residential_address_property_name_number: 'Usual 1',
        usual_residential_address_line_1: 'Usual New Line 1',
        usual_residential_address_line_2: 'Usual New Line 2',
        usual_residential_address_town: 'Usual New Town',
        usual_residential_address_county: 'Usual New County',
        usual_residential_address_country: 'Usual New Country',
        usual_residential_address_postcode: 'Usual NE994WS',
        usual_address_po_box: '',
        usual_address_care_of: '',
        service_address_property_name_number: 'Service 1',
        service_address_line_1: 'Service New Line 1',
        service_address_line_2: 'Service New Line 2',
        service_address_town: 'Service New Town',
        service_address_county: 'Service New County',
        service_address_country: 'Service New Country',
        service_address_postcode: 'Service NE994WS',
        service_address_po_box: '',
        service_address_care_of: '',
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        dateBecameIPDay: '02',
        dateBecameIPMonth: '08',
        dateBecameIPYear: '2023',
      };

      const expectedTrustee = {
        id: 'trustee-id-2',
        type: RoleWithinTrustType.GRANTOR,
        forename: 'Trust',
        other_forenames: '',
        surname: 'Ee',
        dob_day: '01',
        dob_month: '02',
        dob_year: '2022',
        nationality: 'Afghan',
        second_nationality: 'English',
        ura_address_premises: 'Usual 1',
        ura_address_line_1: 'Usual New Line 1',
        ura_address_line_2: 'Usual New Line 2',
        ura_address_locality: 'Usual New Town',
        ura_address_region: 'Usual New County',
        ura_address_country: 'Usual New Country',
        ura_address_postal_code: 'Usual NE994WS',
        ura_address_care_of: '',
        ura_address_po_box: '',
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        sa_address_care_of: '',
        sa_address_po_box: '',
        sa_address_premises: 'Service 1',
        sa_address_line_1: 'Service New Line 1',
        sa_address_line_2: 'Service New Line 2',
        sa_address_locality: 'Service New Town',
        sa_address_region: 'Service New County',
        sa_address_country: 'Service New Country',
        sa_address_postal_code: 'Service NE994WS',
      };

      const trustInReview = {
        trust_id: 'trust-1',
        review_status: { in_review: true },
        INDIVIDUALS: [{
          id: 'trustee-id-2',
          ch_references: 'existing-ch-references',
          type: RoleWithinTrustType.SETTLOR,
          forename: 'Existing Trustee',
          surname: 'Existing Surname',
          dob_day: '31',
          dob_month: '12',
          dob_year: '2002',
          nationality: 'Tanzanian',
          second_nationality: 'Thai',
          ura_address_premises: 'Existing usual premises',
          ura_address_line_1: 'Existing usual line 2',
          ura_address_line_2: 'Existing usual line 2',
          ura_address_locality: 'Existing usual locality',
          ura_address_region: 'Existing usual region',
          ura_address_country: 'Existing usual country',
          ura_address_care_of: '',
          ura_address_postal_code: 'Existing usual postcode',
          ura_address_po_box: '',
          sa_address_premises: 'Existing service premises',
          sa_address_line_1: 'Existing service line 1',
          sa_address_line_2: 'Existing service line 2',
          sa_address_locality: 'Existing service locality',
          sa_address_region: 'Existing service region',
          sa_address_country: 'Existing service country',
          sa_address_care_of: '',
          sa_address_postal_code: 'Existing service postcode',
          sa_address_po_box: '',
          is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        }]
      };

      const appData = {
        entity_number: 'OE988669',
        entity_name: 'Tell us about the individual OE 1',
        update: { review_trusts: [trustInReview] }
      };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrusteeIndex.mockReturnValue(0);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL)
        .send({
          ...formSubmission,
        });

      expect(resp.status).toBe(302);
      expect(resp.header.location).toBe(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(appData.update.review_trusts[0].INDIVIDUALS[0]).toEqual(expectedTrustee);

      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test('when a valid trust submission is provided, and the trust id is not an existing trust, the trust is added to the model', async () => {
      const formSubmission = {
        trusteeId: 'trustee-id-2',
        roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
        forename: 'Trust',
        surname: 'Ee',
        dateOfBirthDay: '01',
        dateOfBirthMonth: '02',
        dateOfBirthYear: '2022',
        nationality: 'Afghan',
        second_nationality: 'English',
        usual_residential_address_property_name_number: 'Usual 1',
        usual_residential_address_line_1: 'Usual New Line 1',
        usual_residential_address_line_2: 'Usual New Line 2',
        usual_residential_address_town: 'Usual New Town',
        usual_residential_address_county: 'Usual New County',
        usual_residential_address_country: 'Usual New Country',
        usual_residential_address_postcode: 'Usual NE994WS',
        usual_address_po_box: '',
        usual_address_care_of: '',
        service_address_property_name_number: 'Usual 1',
        service_address_line_1: 'Usual New Line 1',
        service_address_line_2: 'Usual New Line 2',
        service_address_town: 'Usual New Town',
        service_address_county: 'Usual New County',
        service_address_country: 'Usual New Country',
        service_address_postcode: 'Usual NE994WS',
        service_address_po_box: '',
        service_address_care_of: '',
        is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
        dateBecameIPDay: '02',
        dateBecameIPMonth: '08',
        dateBecameIPYear: '2023',
      };

      const expectedTrustee = {
        id: 'trustee-id-2',
        type: RoleWithinTrustType.BENEFICIARY,
        forename: 'Trust',
        other_forenames: '',
        surname: 'Ee',
        dob_day: '01',
        dob_month: '02',
        dob_year: '2022',
        nationality: 'Afghan',
        second_nationality: 'English',
        ura_address_premises: 'Usual 1',
        ura_address_line_1: 'Usual New Line 1',
        ura_address_line_2: 'Usual New Line 2',
        ura_address_locality: 'Usual New Town',
        ura_address_region: 'Usual New County',
        ura_address_country: 'Usual New Country',
        ura_address_postal_code: 'Usual NE994WS',
        ura_address_care_of: '',
        ura_address_po_box: '',
        is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
        sa_address_premises: '',
        sa_address_line_1: '',
        sa_address_line_2: '',
        sa_address_locality: '',
        sa_address_region: '',
        sa_address_country: '',
        sa_address_postal_code: '',
        sa_address_care_of: '',
        sa_address_po_box: '',
      };

      const existingTrustee = {
        id: 'trustee-id-1',
        ch_references: 'existing-ch-references',
        type: RoleWithinTrustType.SETTLOR,
        forename: 'Existing Trustee',
        surname: 'Existing Surname',
        dob_day: '31',
        dob_month: '12',
        dob_year: '2002',
        nationality: 'Tanzanian',
        second_nationality: 'Thai',
        ura_address_premises: 'Existing usual premises',
        ura_address_line_1: 'Existing usual line 2',
        ura_address_line_2: 'Existing usual line 2',
        ura_address_locality: 'Existing usual locality',
        ura_address_region: 'Existing usual region',
        ura_address_country: 'Existing usual country',
        ura_address_care_of: '',
        ura_address_postal_code: 'Existing usual postcode',
        ura_address_po_box: '',
        sa_address_premises: 'Existing service premises',
        sa_address_line_1: 'Existing service line 1',
        sa_address_line_2: 'Existing service line 2',
        sa_address_locality: 'Existing service locality',
        sa_address_region: 'Existing service region',
        sa_address_country: 'Existing service country',
        sa_address_care_of: '',
        sa_address_postal_code: 'Existing service postcode',
        sa_address_po_box: '',
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
      };

      const trustInReview = {
        trust_id: 'trust-1',
        review_status: { in_review: true },
        INDIVIDUALS: [existingTrustee]
      };

      const appData = {
        entity_number: 'OE988669',
        entity_name: 'Tell us about the individual OE 1',
        update: { review_trusts: [trustInReview] }
      };

      mockIsActiveFeature.mockReturnValue(true);
      mockGetApplicationData.mockReturnValue(appData);
      mockGetTrustInReview.mockReturnValue(trustInReview);
      mockGetTrusteeIndex.mockReturnValue(-1);

      const resp = await request(app)
        .post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL)
        .send({
          ...formSubmission,
        });

      expect(resp.status).toBe(302);
      expect(resp.header.location).toBe(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);

      expect(appData.update.review_trusts[0].INDIVIDUALS[0]).toEqual(existingTrustee);
      expect(appData.update.review_trusts[0].INDIVIDUALS[1]).toEqual(expectedTrustee);

      expect(mockSetExtraData).toHaveBeenCalled();
      expect(mockSaveAndContinue).toHaveBeenCalled();
    });

    test('when feature flag is off, 404 is returned', async () => {
      mockIsActiveFeature.mockReturnValue(false);

      const resp = await request(app).post(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL);

      expect(resp.status).toEqual(404);
      expect(resp.text).toContain(PAGE_NOT_FOUND_TEXT);
    });
  });
});
