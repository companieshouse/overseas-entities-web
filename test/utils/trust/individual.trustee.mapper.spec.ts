jest.mock('uuid');

import { yesNoResponse } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import * as Page from '../../../src/model/trust.page.model';
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
        ['9999', RoleWithinTrustType.BENEFICIARY],
        ['10000', RoleWithinTrustType.GRANTOR],
        ['10001', RoleWithinTrustType.SETTLOR]
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
        usual_residential_address_property_name_number: 'Emerald House',
        usual_residential_address_line_1: 'X Marina Walk',
        usual_residential_address_line_2: 'Rowhedge Wharf',
        usual_residential_address_town: 'Colchester',
        usual_residential_address_county: 'Essex',
        usual_residential_address_country: 'United Kingdom',
        usual_residential_address_postcode: 'COXYDL',
        service_address_property_name_number: 'Emerald House',
        service_address_line_1: 'X Marina Walk',
        service_address_line_2: 'Rowhedge Wharf',
        service_address_town: 'Colchester',
        service_address_county: 'Essex',
        service_address_country: 'United Kingdom',
        service_address_postcode: 'COXYDL',
        date_became_ip_day: '4',
        date_became_ip_month: '4',
        date_became_ip_year: '1964',
        is_service_address_same_as_principal_address: yesNoResponse.Yes
      };

      test.each(testParam)('map Individual trustees', (id: string, roleWithinTrust: Exclude<RoleWithinTrustType, RoleWithinTrustType.INTERESTED_PERSON>) => {
        const mockFormData = {
          ...mockFormDataBasic,
          trustee_id: id,
          type: roleWithinTrust,
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trustee_id,
          type: mockFormData.type,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          date_of_birth_day: mockFormData.date_of_birth_day,
          date_of_birth_month: mockFormData.date_of_birth_month,
          date_of_birth_year: mockFormData.date_of_birth_year,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.usual_residential_address_property_name_number,
          ura_address_line1: mockFormData.usual_residential_address_line_1,
          ura_address_line2: mockFormData.usual_residential_address_line_2,
          ura_address_locality: mockFormData.usual_residential_address_town,
          ura_address_region: mockFormData.usual_residential_address_county,
          ura_address_country: mockFormData.usual_residential_address_country,
          ura_address_postal_code: mockFormData.usual_residential_address_postcode,
          ura_address_care_of: '',
          ura_address_po_box: '',
          is_service_address_same_as_principal_address: mockFormData.is_service_address_same_as_principal_address,
          sa_address_premises: mockFormData.service_address_property_name_number,
          sa_address_line1: mockFormData.service_address_line_1,
          sa_address_line2: mockFormData.service_address_line_2,
          sa_address_locality: mockFormData.service_address_town,
          sa_address_region: mockFormData.service_address_county,
          sa_address_country: mockFormData.service_address_country,
          sa_address_postal_code: mockFormData.service_address_postcode,
          sa_address_care_of: '',
          sa_address_po_box: '',
        });
      });

      test('map Interested trustees', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trustee_id: '10002',
          type: RoleWithinTrustType.INTERESTED_PERSON,
          date_became_ip_day: '2',
          date_became_ip_month: '11',
          date_became_ip_year: '2022',
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trustee_id,
          type: mockFormData.type,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          date_of_birth_day: mockFormData.date_of_birth_day,
          date_of_birth_month: mockFormData.date_of_birth_month,
          date_of_birth_year: mockFormData.date_of_birth_year,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.usual_residential_address_property_name_number,
          ura_address_line1: mockFormData.usual_residential_address_line_1,
          ura_address_line2: mockFormData.usual_residential_address_line_2,
          ura_address_locality: mockFormData.usual_residential_address_town,
          ura_address_region: mockFormData.usual_residential_address_county,
          ura_address_country: mockFormData.usual_residential_address_country,
          ura_address_postal_code: mockFormData.usual_residential_address_postcode,
          ura_address_care_of: '',
          ura_address_po_box: '',
          is_service_address_same_as_principal_address: mockFormData.is_service_address_same_as_principal_address,
          sa_address_premises: mockFormData.service_address_property_name_number,
          sa_address_line1: mockFormData.service_address_line_1,
          sa_address_line2: mockFormData.service_address_line_2,
          sa_address_locality: mockFormData.service_address_town,
          sa_address_region: mockFormData.service_address_county,
          sa_address_country: mockFormData.service_address_country,
          sa_address_postal_code: mockFormData.service_address_postcode,
          sa_address_care_of: '',
          sa_address_po_box: '',
          date_became_interested_person_day: mockFormData.date_became_ip_day,
          date_became_interested_person_month: mockFormData.date_became_ip_month,
          date_became_interested_person_year: mockFormData.date_became_ip_year,
        });
      });
    });
  });
});
