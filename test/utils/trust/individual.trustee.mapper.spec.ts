jest.mock('uuid');

import { TrustIndividual, yesNoResponse } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ApplicationData } from "../../../src/model";
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import { IndividualTrustee, TrustKey } from "../../../src/model/trust.model";
import * as Page from '../../../src/model/trust.page.model';
import {
  mapIndividualTrusteeByIdFromSessionToPage,
  mapIndividualTrusteeFromSessionToPage,
  mapIndividualTrusteeToSession,
} from '../../../src/utils/trust/individual.trustee.mapper';

describe('Individual Beneficial Owner page Mapper Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const testParam = [
    ['9999', RoleWithinTrustType.BENEFICIARY],
    ['10000', RoleWithinTrustType.GRANTOR],
    ['10001', RoleWithinTrustType.SETTLOR]
  ];
  describe('To Session mapper methods test', () => {

    describe('Individual Beneficial Owner mapper', () => {

      const mockFormDataBasic = {
        forename: 'Joe',
        surname: 'Bloggs',
        other_forenames: "",
        dateOfBirthDay: '22',
        dateOfBirthMonth: '11',
        dateOfBirthYear: '1946',
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
        dateBecameIPDay: '4',
        dateBecameIPMonth: '4',
        dateBecameIPYear: '1964',
      };

      test.each(testParam)('map Individual trustees', (id: string, roleWithinTrust: Exclude<RoleWithinTrustType, RoleWithinTrustType.INTERESTED_PERSON>) => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: id,
          roleWithinTrust,
          is_service_address_same_as_usual_residential_address: yesNoResponse.No
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trusteeId,
          type: mockFormData.roleWithinTrust,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          dob_day: mockFormData.dateOfBirthDay,
          dob_month: mockFormData.dateOfBirthMonth,
          dob_year: mockFormData.dateOfBirthYear,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.usual_residential_address_property_name_number,
          ura_address_line_1: mockFormData.usual_residential_address_line_1,
          ura_address_line_2: mockFormData.usual_residential_address_line_2,
          ura_address_locality: mockFormData.usual_residential_address_town,
          ura_address_region: mockFormData.usual_residential_address_county,
          ura_address_country: mockFormData.usual_residential_address_country,
          ura_address_postal_code: mockFormData.usual_residential_address_postcode,
          ura_address_care_of: '',
          ura_address_po_box: '',
          is_service_address_same_as_usual_residential_address: mockFormData.is_service_address_same_as_usual_residential_address,
          sa_address_premises: mockFormData.service_address_property_name_number,
          sa_address_line_1: mockFormData.service_address_line_1,
          sa_address_line_2: mockFormData.service_address_line_2,
          sa_address_locality: mockFormData.service_address_town,
          sa_address_region: mockFormData.service_address_county,
          sa_address_country: mockFormData.service_address_country,
          sa_address_postal_code: mockFormData.service_address_postcode,
          sa_address_care_of: '',
          sa_address_po_box: '',
        });
      });

      test('map Individual trustee with same service address as residential address', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '198',
          roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
          is_service_address_same_as_usual_residential_address: yesNoResponse.Yes
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trusteeId,
          type: mockFormData.roleWithinTrust,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          dob_day: mockFormData.dateOfBirthDay,
          dob_month: mockFormData.dateOfBirthMonth,
          dob_year: mockFormData.dateOfBirthYear,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.usual_residential_address_property_name_number,
          ura_address_line_1: mockFormData.usual_residential_address_line_1,
          ura_address_line_2: mockFormData.usual_residential_address_line_2,
          ura_address_locality: mockFormData.usual_residential_address_town,
          ura_address_region: mockFormData.usual_residential_address_county,
          ura_address_country: mockFormData.usual_residential_address_country,
          ura_address_postal_code: mockFormData.usual_residential_address_postcode,
          ura_address_care_of: '',
          ura_address_po_box: '',
          is_service_address_same_as_usual_residential_address: mockFormData.is_service_address_same_as_usual_residential_address,
          sa_address_premises: '',
          sa_address_line_1: '',
          sa_address_line_2: '',
          sa_address_locality: '',
          sa_address_region: '',
          sa_address_country: '',
          sa_address_postal_code: '',
          sa_address_care_of: '',
          sa_address_po_box: '',
        });
      });

      test('map Interested trustees', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '10002',
          roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
          dateBecameIPDay: '2',
          dateBecameIPMonth: '11',
          dateBecameIPYear: '2022',
          is_service_address_same_as_usual_residential_address: yesNoResponse.No
        };

        expect(mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData)).toEqual({
          id: mockFormData.trusteeId,
          type: mockFormData.roleWithinTrust,
          forename: mockFormData.forename,
          surname: mockFormData.surname,
          other_forenames: '',
          dob_day: mockFormData.dateOfBirthDay,
          dob_month: mockFormData.dateOfBirthMonth,
          dob_year: mockFormData.dateOfBirthYear,
          nationality: mockFormData.nationality,
          second_nationality: mockFormData.second_nationality,
          ura_address_premises: mockFormData.usual_residential_address_property_name_number,
          ura_address_line_1: mockFormData.usual_residential_address_line_1,
          ura_address_line_2: mockFormData.usual_residential_address_line_2,
          ura_address_locality: mockFormData.usual_residential_address_town,
          ura_address_region: mockFormData.usual_residential_address_county,
          ura_address_country: mockFormData.usual_residential_address_country,
          ura_address_postal_code: mockFormData.usual_residential_address_postcode,
          ura_address_care_of: '',
          ura_address_po_box: '',
          is_service_address_same_as_usual_residential_address: mockFormData.is_service_address_same_as_usual_residential_address,
          sa_address_premises: mockFormData.service_address_property_name_number,
          sa_address_line_1: mockFormData.service_address_line_1,
          sa_address_line_2: mockFormData.service_address_line_2,
          sa_address_locality: mockFormData.service_address_town,
          sa_address_region: mockFormData.service_address_county,
          sa_address_country: mockFormData.service_address_country,
          sa_address_postal_code: mockFormData.service_address_postcode,
          sa_address_care_of: '',
          sa_address_po_box: '',
          date_became_interested_person_day: mockFormData.dateBecameIPDay,
          date_became_interested_person_month: mockFormData.dateBecameIPMonth,
          date_became_interested_person_year: mockFormData.dateBecameIPYear,
        });
      });

      test('trustee Id should not be null after mapping', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
          dateBecameIPDay: '2',
          dateBecameIPMonth: '11',
          dateBecameIPYear: '2022',
          is_service_address_same_as_usual_residential_address: yesNoResponse.No
        };
        const mappedObj = mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData);

        expect(mappedObj.id).not.toBeNull();
      });
    });
  });
  describe('To Session mapper methods test', () => {

    const test_trust_id = '342';
    const test_trustee_id = '999';

    const mockSessionDataBasic = {
      id: test_trustee_id,
      forename: "firstName",
      surname: "surname",
      other_forenames: '',
      dob_day: "01",
      dob_month: "02",
      dob_year: "1999",
      nationality: "scottish",
      second_nationality: "irish",
      ura_address_premises: "1",
      ura_address_line_1: "ura1",
      ura_address_line_2: "ura2",
      ura_address_locality: "uraTown",
      ura_address_region: "uraRegion",
      ura_address_country: "uraCountry",
      ura_address_postal_code: "cf453ws",
      ura_address_care_of: '',
      ura_address_po_box: '',
      is_service_address_same_as_usual_residential_address: yesNoResponse.No,
      sa_address_premises: "2",
      sa_address_line_1: "sa1",
      sa_address_line_2: "sa2",
      sa_address_locality: "saTown",
      sa_address_region: "saRegion",
      sa_address_country: "saCountry",
      sa_address_postal_code: "cf482lw",
      sa_address_care_of: '',
      sa_address_po_box: '',
    } as IndividualTrustee;

    test.each(testParam)('map Individual trustee by id', (roleWithinTrust: Exclude<RoleWithinTrustType, RoleWithinTrustType.INTERESTED_PERSON>) => {
      const mockSessionData = {
        ...mockSessionDataBasic,
        type: roleWithinTrust,
      };

      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'INDIVIDUALS': [ mockSessionData ] as TrustIndividual[],
        }]
      } as ApplicationData;

      expect(mapIndividualTrusteeByIdFromSessionToPage(appData, test_trust_id, test_trustee_id)).toEqual({
        trusteeId: mockSessionData.id,
        forename: mockSessionData.forename,
        surname: mockSessionData.surname,
        roleWithinTrust: mockSessionData.type,
        dateOfBirthDay: mockSessionData.dob_day,
        dateOfBirthMonth: mockSessionData.dob_month,
        dateOfBirthYear: mockSessionData.dob_year,
        nationality: mockSessionData.nationality,
        second_nationality: mockSessionData.second_nationality,
        usual_residential_address_property_name_number: mockSessionData.ura_address_premises,
        usual_residential_address_line_1: mockSessionData.ura_address_line_1,
        usual_residential_address_line_2: mockSessionData.ura_address_line_2,
        usual_residential_address_town: mockSessionData.ura_address_locality,
        usual_residential_address_county: mockSessionData.ura_address_region,
        usual_residential_address_country: mockSessionData.ura_address_country,
        usual_residential_address_postcode: mockSessionData.ura_address_postal_code,
        service_address_property_name_number: mockSessionData.sa_address_premises,
        service_address_line_1: mockSessionData.sa_address_line_1,
        service_address_line_2: mockSessionData.sa_address_line_2,
        service_address_town: mockSessionData.sa_address_locality,
        service_address_county: mockSessionData.sa_address_region,
        service_address_country: mockSessionData.sa_address_country,
        service_address_postcode: mockSessionData.sa_address_postal_code,
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        is_newly_added: true,
      });
    });

    test.each(testParam)('map Individual trustee', (roleWithinTrust: Exclude<RoleWithinTrustType, RoleWithinTrustType.INTERESTED_PERSON>) => {
      const mockSessionData = {
        ...mockSessionDataBasic,
        type: roleWithinTrust,
      };

      expect(mapIndividualTrusteeFromSessionToPage(mockSessionData)).toEqual({
        trusteeId: mockSessionData.id,
        forename: mockSessionData.forename,
        surname: mockSessionData.surname,
        roleWithinTrust: mockSessionData.type,
        dateOfBirthDay: mockSessionData.dob_day,
        dateOfBirthMonth: mockSessionData.dob_month,
        dateOfBirthYear: mockSessionData.dob_year,
        nationality: mockSessionData.nationality,
        second_nationality: mockSessionData.second_nationality,
        usual_residential_address_property_name_number: mockSessionData.ura_address_premises,
        usual_residential_address_line_1: mockSessionData.ura_address_line_1,
        usual_residential_address_line_2: mockSessionData.ura_address_line_2,
        usual_residential_address_town: mockSessionData.ura_address_locality,
        usual_residential_address_county: mockSessionData.ura_address_region,
        usual_residential_address_country: mockSessionData.ura_address_country,
        usual_residential_address_postcode: mockSessionData.ura_address_postal_code,
        service_address_property_name_number: mockSessionData.sa_address_premises,
        service_address_line_1: mockSessionData.sa_address_line_1,
        service_address_line_2: mockSessionData.sa_address_line_2,
        service_address_town: mockSessionData.sa_address_locality,
        service_address_county: mockSessionData.sa_address_region,
        service_address_country: mockSessionData.sa_address_country,
        service_address_postcode: mockSessionData.sa_address_postal_code,
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        is_newly_added: true,
      });
    });

    test('map interested trustee by id', () => {
      const mockSessionData = {
        ...mockSessionDataBasic,
        type: RoleWithinTrustType.INTERESTED_PERSON,
        date_became_interested_person_day: '2',
        date_became_interested_person_month: '11',
        date_became_interested_person_year: '2022',
      };

      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'INDIVIDUALS': [ mockSessionData ] as TrustIndividual[],
        }]
      } as ApplicationData;

      expect(mapIndividualTrusteeByIdFromSessionToPage(appData, test_trust_id, test_trustee_id)).toEqual({
        trusteeId: mockSessionData.id,
        forename: mockSessionData.forename,
        surname: mockSessionData.surname,
        roleWithinTrust: mockSessionData.type,
        dateOfBirthDay: mockSessionData.dob_day,
        dateOfBirthMonth: mockSessionData.dob_month,
        dateOfBirthYear: mockSessionData.dob_year,
        nationality: mockSessionData.nationality,
        second_nationality: mockSessionData.second_nationality,
        usual_residential_address_property_name_number: mockSessionData.ura_address_premises,
        usual_residential_address_line_1: mockSessionData.ura_address_line_1,
        usual_residential_address_line_2: mockSessionData.ura_address_line_2,
        usual_residential_address_town: mockSessionData.ura_address_locality,
        usual_residential_address_county: mockSessionData.ura_address_region,
        usual_residential_address_country: mockSessionData.ura_address_country,
        usual_residential_address_postcode: mockSessionData.ura_address_postal_code,
        service_address_property_name_number: mockSessionData.sa_address_premises,
        service_address_line_1: mockSessionData.sa_address_line_1,
        service_address_line_2: mockSessionData.sa_address_line_2,
        service_address_town: mockSessionData.sa_address_locality,
        service_address_county: mockSessionData.sa_address_region,
        service_address_country: mockSessionData.sa_address_country,
        service_address_postcode: mockSessionData.sa_address_postal_code,
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        dateBecameIPDay: mockSessionData.date_became_interested_person_day,
        dateBecameIPMonth: mockSessionData.date_became_interested_person_month,
        dateBecameIPYear: mockSessionData.date_became_interested_person_year,
        is_newly_added: true,
      });
    });

    test('map interested trustee', () => {
      const mockSessionData = {
        ...mockSessionDataBasic,
        type: RoleWithinTrustType.INTERESTED_PERSON,
        date_became_interested_person_day: '2',
        date_became_interested_person_month: '11',
        date_became_interested_person_year: '2022',
      };

      expect(mapIndividualTrusteeFromSessionToPage(mockSessionData)).toEqual({
        trusteeId: mockSessionData.id,
        forename: mockSessionData.forename,
        surname: mockSessionData.surname,
        roleWithinTrust: mockSessionData.type,
        dateOfBirthDay: mockSessionData.dob_day,
        dateOfBirthMonth: mockSessionData.dob_month,
        dateOfBirthYear: mockSessionData.dob_year,
        nationality: mockSessionData.nationality,
        second_nationality: mockSessionData.second_nationality,
        usual_residential_address_property_name_number: mockSessionData.ura_address_premises,
        usual_residential_address_line_1: mockSessionData.ura_address_line_1,
        usual_residential_address_line_2: mockSessionData.ura_address_line_2,
        usual_residential_address_town: mockSessionData.ura_address_locality,
        usual_residential_address_county: mockSessionData.ura_address_region,
        usual_residential_address_country: mockSessionData.ura_address_country,
        usual_residential_address_postcode: mockSessionData.ura_address_postal_code,
        service_address_property_name_number: mockSessionData.sa_address_premises,
        service_address_line_1: mockSessionData.sa_address_line_1,
        service_address_line_2: mockSessionData.sa_address_line_2,
        service_address_town: mockSessionData.sa_address_locality,
        service_address_county: mockSessionData.sa_address_region,
        service_address_country: mockSessionData.sa_address_country,
        service_address_postcode: mockSessionData.sa_address_postal_code,
        is_service_address_same_as_usual_residential_address: yesNoResponse.No,
        dateBecameIPDay: mockSessionData.date_became_interested_person_day,
        dateBecameIPMonth: mockSessionData.date_became_interested_person_month,
        dateBecameIPYear: mockSessionData.date_became_interested_person_year,
        is_newly_added: true,
      });
    });
  });
});
