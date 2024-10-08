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
          is_service_address_same_as_usual_residential_address: yesNoResponse.No,
          stillInvolved: '0',
          ceasedDateDay: '24',
          ceasedDateMonth: '11',
          ceasedDateYear: '2023',
          startDateDay: '',
          startDateMonth: '',
          startDateYear: ''
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
          still_involved: 'No',
          ceased_date_day: '24',
          ceased_date_month: '11',
          ceased_date_year: '2023',
          start_date_day: '',
          start_date_month: '',
          start_date_year: ''
        });
      });

      test('map Individual trustee with same service address as residential address', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '198',
          roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
          is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
          stillInvolved: '0',
          ceasedDateDay: '24',
          ceasedDateMonth: '11',
          ceasedDateYear: '2023',
          startDateDay: '10',
          startDateMonth: '11',
          startDateYear: '2020'
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
          still_involved: 'No',
          ceased_date_day: '24',
          ceased_date_month: '11',
          ceased_date_year: '2023',
          start_date_day: '10',
          start_date_month: '11',
          start_date_year: '2020'
        });
      });

      test('Map start_date to session when relevant_period is true', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '198',
          roleWithinTrust: RoleWithinTrustType.BENEFICIARY,
          is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
          stillInvolved: '0',
          ceasedDateDay: '24',
          ceasedDateMonth: '11',
          ceasedDateYear: '2023',
          startDateDay: "11",
          startDateMonth: "12",
          startDateYear: "2012"
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
          still_involved: 'No',
          ceased_date_day: '24',
          ceased_date_month: '11',
          ceased_date_year: '2023',
          start_date_day: mockFormData.startDateDay,
          start_date_month: mockFormData.startDateMonth,
          start_date_year: mockFormData.startDateYear
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
          is_service_address_same_as_usual_residential_address: yesNoResponse.No,
          stillInvolved: '0',
          ceasedDateDay: '24',
          ceasedDateMonth: '11',
          ceasedDateYear: '2023',
          startDateDay: '12',
          startDateMonth: '12',
          startDateYear: '2020'
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
          still_involved: 'No',
          ceased_date_day: '24',
          ceased_date_month: '11',
          ceased_date_year: '2023',
          start_date_day: '12',
          start_date_month: '12',
          start_date_year: '2020'
        });
      });

      test('map individual trustees should remove ceased date if still involved', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '10002',
          roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
          dateBecameIPDay: '2',
          dateBecameIPMonth: '11',
          dateBecameIPYear: '2022',
          is_service_address_same_as_usual_residential_address: yesNoResponse.No,
          stillInvolved: '1',
          ceasedDateDay: '24',
          ceasedDateMonth: '11',
          ceasedDateYear: '2023',
          startDateDay: '14',
          startDateMonth: '12',
          startDateYear: '2020'
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
          still_involved: 'Yes',
          ceased_date_day: '',
          ceased_date_month: '',
          ceased_date_year: '',
          start_date_day: '14',
          start_date_month: '12',
          start_date_year: '2020'
        });
      });

      test('trustee Id should not be null after mapping', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
          dateBecameIPDay: '2',
          dateBecameIPMonth: '11',
          dateBecameIPYear: '2022',
          is_service_address_same_as_usual_residential_address: yesNoResponse.No,
          startDateDay: '14',
          startDateMonth: '12',
          startDateYear: '2020'
        };
        const mappedObj = mapIndividualTrusteeToSession(<Page.IndividualTrusteesFormCommon>mockFormData);

        expect(mappedObj.id).not.toBeNull();
      });

      test("map individual trustees should not set 'still_involved' if no question response received", () => {
        const mockFormData = {
          ...mockFormDataBasic,
          trusteeId: '10002',
          roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
          dateBecameIPDay: '2',
          dateBecameIPMonth: '11',
          dateBecameIPYear: '2022',
          is_service_address_same_as_usual_residential_address: yesNoResponse.No,
          stillInvolved: undefined,
          ceasedDateDay: '24',
          ceasedDateMonth: '11',
          ceasedDateYear: '2023',
          startDateDay: '14',
          startDateMonth: '12',
          startDateYear: '2020'
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
          still_involved: null,
          ceased_date_day: '',
          ceased_date_month: '',
          ceased_date_year: '',
          start_date_day: '14',
          start_date_month: '12',
          start_date_year: '2020'
        });
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
      still_involved: 'No',
      ceased_date_day: '24',
      ceased_date_month: '11',
      ceased_date_year: '2023'
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
        stillInvolved: '0',
        ceasedDateDay: mockSessionData.ceased_date_day,
        ceasedDateMonth: mockSessionData.ceased_date_month,
        ceasedDateYear: mockSessionData.ceased_date_year
      });
    });

    test.each(testParam)('map Individual trustee', (roleWithinTrust: Exclude<RoleWithinTrustType, RoleWithinTrustType.HISTORICAL_BENEFICIAL_OWNER>) => {
      const mockSessionData: IndividualTrustee = {
        ...mockSessionDataBasic,
        type: roleWithinTrust,
      } as IndividualTrustee;

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
        stillInvolved: '0',
        ceasedDateDay: mockSessionData.ceased_date_day,
        ceasedDateMonth: mockSessionData.ceased_date_month,
        ceasedDateYear: mockSessionData.ceased_date_year
      });
    });

    test('map interested trustee by id', () => {
      const mockSessionData = {
        ...mockSessionDataBasic,
        type: RoleWithinTrustType.INTERESTED_PERSON,
        date_became_interested_person_day: '2',
        date_became_interested_person_month: '11',
        date_became_interested_person_year: '2022',
        still_involved: "Yes"
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
        stillInvolved: '1',
        ceasedDateDay: mockSessionData.ceased_date_day,
        ceasedDateMonth: mockSessionData.ceased_date_month,
        ceasedDateYear: mockSessionData.ceased_date_year
      });
    });

    test("map interested trustee by id when 'still_involved' value is invalid", () => {
      const mockSessionData = {
        ...mockSessionDataBasic,
        type: RoleWithinTrustType.INTERESTED_PERSON,
        date_became_interested_person_day: '2',
        date_became_interested_person_month: '11',
        date_became_interested_person_year: '2022',
        still_involved: "Illegal-Value"
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
        stillInvolved: '',
        ceasedDateDay: mockSessionData.ceased_date_day,
        ceasedDateMonth: mockSessionData.ceased_date_month,
        ceasedDateYear: mockSessionData.ceased_date_year
      });
    });

    test('map interested trustee', () => {
      const mockSessionData: IndividualTrustee = {
        ...mockSessionDataBasic,
        type: RoleWithinTrustType.INTERESTED_PERSON,
        date_became_interested_person_day: '2',
        date_became_interested_person_month: '11',
        date_became_interested_person_year: '2022',
        still_involved: undefined
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
        stillInvolved: '',
        ceasedDateDay: mockSessionData.ceased_date_day,
        ceasedDateMonth: mockSessionData.ceased_date_month,
        ceasedDateYear: mockSessionData.ceased_date_year
      });
    });
  });
});
