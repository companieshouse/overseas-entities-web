jest.mock('uuid');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import * as Page from '../../../src/model/trust.page.model';
import { TrusteeType } from "../../../src/model/trustee.type.model";
import {
  mapIndividualTrusteeToSession,
} from '../../../src/utils/trust/individual.trustee.mapper';

describe('Individual Beneficial Owner page Mapper Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('To Session mapper methods test', () => {
    describe('Individual Beneficial Owner mapper', () => {
      const testParam = [
        ['9999', RoleWithinTrustType.BENEFICIARY, TrusteeType.INDIVIDUAL],
        ['10000', RoleWithinTrustType.GRANTOR, TrusteeType.LEGAL_ENTITY],
        ['10001', RoleWithinTrustType.SETTLOR, TrusteeType.INDIVIDUAL]
      ];

      const mockFormDataBasic = {
        forename: 'Joe',
        surname: 'Bloggs',
        other_forenames: "",
        date_of_birth_day: '22',
        date_of_birth_month: '11',
        date_of_birth_year: '1946',
        nationality: 'Cameroon',
        second_nationality: 'Japan',
        property_name: 'Emerald House',
        address_line1: 'X Marina Walk',
        address_line2: 'Rowhedge Wharf',
        city: 'Colchester',
        county: 'Essex',
        country: 'United Kingdom',
        postal_code: 'COXYDL',
        correspondence_property_name: 'Emerald House',
        correspondence_address_line1: 'X Marina Walk',
        correspondence_address_line2: 'Rowhedge Wharf',
        correspondence_city: 'Colchester',
        correspondence_county: 'Essex',
        correspondence_country: 'United Kingdom',
        correspondence_postal_code: 'COXYDL',
        date_became_ip_day: '4',
        date_became_ip_month: '4',
        date_became_ip_year: '1964',
      };

      test.each(testParam)('map Individual trustees', (id: string, roleWithinTrust: Exclude<RoleWithinTrustType, RoleWithinTrustType.INTERESTED_PERSON>, type) => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: id,
          role: roleWithinTrust,
          type: type,
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trusteeId,
          type: mockFormData.type,
          role: mockFormData.role,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          ura_address_care_of: '',
          ura_address_po_box: '',
          date_of_birth_day: mockFormData.date_of_birth_day,
          date_of_birth_month: mockFormData.date_of_birth_month,
          date_of_birth_year: mockFormData.date_of_birth_year,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.property_name,
          ura_address_line1: mockFormData.address_line1,
          ura_address_line2: mockFormData.address_line2,
          ura_address_locality: mockFormData.city,
          ura_address_region: mockFormData.county,
          ura_address_country: mockFormData.country,
          ura_address_postal_code: mockFormData.postal_code,
          sa_address_premises: mockFormData.correspondence_property_name,
          sa_address_line1: mockFormData.correspondence_address_line1,
          sa_address_line2: mockFormData.correspondence_address_line2,
          sa_address_locality: mockFormData.correspondence_city,
          sa_address_region: mockFormData.correspondence_county,
          sa_address_country: mockFormData.correspondence_country,
          sa_address_postal_code: mockFormData.correspondence_postal_code,
          sa_address_po_box: '',
          sa_address_care_of: '',
        });
      });

      test('map Interested trustees', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '10002',
          type: TrusteeType.INDIVIDUAL,
          role: RoleWithinTrustType.INTERESTED_PERSON,
          date_became_ip_day: '2',
          date_became_ip_month: '11',
          date_became_ip_year: '2022',
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trusteeId,
          type: mockFormData.type,
          role: mockFormData.role,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          ura_address_care_of: '',
          ura_address_po_box: '',
          date_of_birth_day: mockFormData.date_of_birth_day,
          date_of_birth_month: mockFormData.date_of_birth_month,
          date_of_birth_year: mockFormData.date_of_birth_year,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.property_name,
          ura_address_line1: mockFormData.address_line1,
          ura_address_line2: mockFormData.address_line2,
          ura_address_locality: mockFormData.city,
          ura_address_region: mockFormData.county,
          ura_address_country: mockFormData.country,
          ura_address_postal_code: mockFormData.postal_code,
          sa_address_premises: mockFormData.correspondence_property_name,
          sa_address_line1: mockFormData.correspondence_address_line1,
          sa_address_line2: mockFormData.correspondence_address_line2,
          sa_address_locality: mockFormData.correspondence_city,
          sa_address_region: mockFormData.correspondence_county,
          sa_address_country: mockFormData.correspondence_country,
          sa_address_postal_code: mockFormData.correspondence_postal_code,
          sa_address_po_box: '',
          sa_address_care_of: '',
          date_became_interested_person_day: mockFormData.date_became_ip_day,
          date_became_interested_person_month: mockFormData.date_became_ip_month,
          date_became_interested_person_year: mockFormData.date_became_ip_year,
        });
      });
    });
  });
});
