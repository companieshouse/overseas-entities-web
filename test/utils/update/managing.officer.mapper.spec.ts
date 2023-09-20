import { CompanyOfficer } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';
import { ManagingOfficerPrivateData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { yesNoResponse } from '../../../src/model/data.types.model';
import {
  mapToManagingOfficer,
  mapToManagingOfficerCorporate,
  getFormerNames,
  mapIndividualMoPrivateData,
  mapCorporateMoPrivateAddress
} from '../../../src/utils/update/managing.officer.mapper';
import {
  MANAGING_OFFICER_MOCK_MAP_DATA,
  MOCK_MANAGING_OFFICERS_PRIVATE_DATA,
  UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK,
  UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK,
  MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
  MOCKED_PRIVATE_ADDRESS,
  MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF
} from '../../__mocks__/session.mock';
import { managingOfficerMock, managingOfficerMockDualNationality } from './mocks';
import { mapBOMOAddress } from '../../../src/utils/update/mapper.utils';

describe("Test mapping to managing officer", () => {

  test(`That officer data is mapped correctly to managing officer`, () => {
    expect(mapToManagingOfficer(MANAGING_OFFICER_MOCK_MAP_DATA)).resolves;
  });

  test(`That officer data is mapped correctly to managing officer corporate`, () => {
    expect(mapToManagingOfficerCorporate(MANAGING_OFFICER_MOCK_MAP_DATA)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapToManagingOfficer({} as CompanyOfficer)).toThrowError;
  });

  test(`error is thrown when undefined data is parsed to data mapper (corporate)`, () => {
    expect(mapToManagingOfficerCorporate({} as CompanyOfficer)).toThrowError;
  });

  test('map officer data to managing officer should return object', () => {
    expect(mapToManagingOfficer(managingOfficerMock)).toEqual({
      id: "selfLink",
      ch_reference: "selfLink",
      first_name: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.first_name,
      last_name: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.last_name,
      has_former_names: yesNoResponse.Yes,
      former_names: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.former_names,
      date_of_birth: {
        day: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.date_of_birth?.day,
        month: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.date_of_birth?.month,
        year: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.date_of_birth?.year
      },
      nationality: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.nationality,
      second_nationality: undefined,
      start_date: {
        day: "1",
        month: "4",
        year: "2023",
      },
      usual_residential_address: undefined,
      is_service_address_same_as_usual_residential_address: yesNoResponse.No,
      service_address: {
        property_name_number: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.property_name_number,
        line_1: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.line_1,
        line_2: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.line_2,
        town: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.town,
        county: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.county,
        country: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.country,
        postcode: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.service_address?.postcode,
      },
      occupation: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.occupation,
      role_and_responsibilities: UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK.role_and_responsibilities
    });
  });

  test('map officer data to managing officer with two nationalities should return object', () => {
    expect(mapToManagingOfficer(managingOfficerMockDualNationality)).toEqual({
      id: "selfLink",
      ch_reference: "selfLink",
      first_name: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.first_name,
      last_name: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.last_name,
      has_former_names: yesNoResponse.Yes,
      former_names: getFormerNames(managingOfficerMockDualNationality.formerNames),
      date_of_birth: {
        day: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.date_of_birth?.day,
        month: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.date_of_birth?.month,
        year: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.date_of_birth?.year
      },
      nationality: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.nationality,
      second_nationality: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.second_nationality,
      start_date: {
        day: "1",
        month: "4",
        year: "2023",
      },
      usual_residential_address: undefined,
      is_service_address_same_as_usual_residential_address: yesNoResponse.No,
      service_address: {
        property_name_number: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.property_name_number,
        line_1: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.line_1,
        line_2: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.line_2,
        town: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.town,
        county: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.county,
        country: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.country,
        postcode: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.service_address?.postcode,
      },
      occupation: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.occupation,
      role_and_responsibilities: UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK.role_and_responsibilities
    });
  });

  test('map officer data to managing officer corporate should return object', () => {
    expect(mapToManagingOfficerCorporate(managingOfficerMock)).toEqual({
      id: "selfLink",
      ch_reference: "selfLink",
      name: managingOfficerMock.name,
      principal_address: undefined,
      is_service_address_same_as_principal_address: undefined,
      start_date: {
        day: "1",
        month: "4",
        year: "2023",
      },
      service_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.addressLine1,
        line_2: managingOfficerMock.address.addressLine2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postalCode,
      },
      legal_form: managingOfficerMock.identification?.legalForm,
      law_governed: managingOfficerMock.identification?.legalAuthority,
      is_on_register_in_country_formed_in: yesNoResponse.Yes,
      public_register_name: managingOfficerMock.identification?.placeRegistered,
      registration_number: managingOfficerMock.identification?.registrationNumber,
      contact_full_name: managingOfficerMock.contactDetails?.contactName,
      role_and_responsibilities: managingOfficerMock.responsibilities,
    });
  });

  describe('Test mapping for Individual MO Private Data', () => {

    const mappedAddress = {
      property_name_number: "private_premises",
      line_1: "private_addressLine1",
      line_2: "private_addressLine2",
      town: "private_locality",
      county: "private_region",
      country: "private_country",
      postcode: "private_postalCode"
    };

    test('that usual residential address for Individual Managing Officer is correctly mapped', () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
        usual_residential_address: undefined,
      };

      mapIndividualMoPrivateData(MOCK_MANAGING_OFFICERS_PRIVATE_DATA, managingOfficer);

      expect(managingOfficer.usual_residential_address).toEqual(mappedAddress);
    });

    test('that an undefined is returned when moPrivateData is empty', () => {
      const emptyPrivateData: ManagingOfficerPrivateData[] = [];
      const address = mapIndividualMoPrivateData(emptyPrivateData, MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF);
      expect(address).toBeUndefined();
    });

    test('that an undefined is returned when no matching hashedId is found', () => {
      const NoMatchingCHRef = {
        ...MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
        ch_reference: 'non_existent_ch_ref'
      };
      const address = mapIndividualMoPrivateData(MOCK_MANAGING_OFFICERS_PRIVATE_DATA, NoMatchingCHRef);
      expect(address).toBeUndefined();
    });

    test('Date Of Birth for Individual Managing Officer is correctly mapped', () => {
      const managingOfficer = {
        ...MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
        date_of_birth: undefined
      };

      mapIndividualMoPrivateData(MOCK_MANAGING_OFFICERS_PRIVATE_DATA, managingOfficer);
      expect(managingOfficer.date_of_birth).toEqual({ day: "1", month: "1", year: "1990" });
    });

    test('DOB Undefined when moPrivateData is empty', () => {
      const emptyPrivateData: ManagingOfficerPrivateData[] = [];
      const dob = mapIndividualMoPrivateData(emptyPrivateData, MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF);
      expect(dob).toBeUndefined();
    });

    test('DOB Undefined when no matching hashedId is found', () => {
      const NoMatchingCHRef = {
        ...MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF,
        ch_reference: 'non_existent_ch_ref'
      };

      const dob = mapIndividualMoPrivateData(MOCK_MANAGING_OFFICERS_PRIVATE_DATA, NoMatchingCHRef);
      expect(dob).toBeUndefined();
    });

    test('DOB Undefined when managingOfficerData.dateOfBirth is undefined', () => {
      const mockDataWithUndefinedDOB: ManagingOfficerPrivateData[] =
        [
          {
            ...MOCK_MANAGING_OFFICERS_PRIVATE_DATA[0],
            dateOfBirth: undefined,
            hashedId: 'hashedId1',
          },
        ];
      const dob = mapIndividualMoPrivateData(mockDataWithUndefinedDOB, MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF);
      expect(dob).toBeUndefined();
    });

    test('that undefined is returned when residential address is undefined', () => {
      const mockDataWithUndefinedAddresses: ManagingOfficerPrivateData[] =
        [
          {
            ...MOCK_MANAGING_OFFICERS_PRIVATE_DATA[0],
            residentialAddress: undefined,
            hashedId: 'hashedId1',
          },
        ];
      const address = mapIndividualMoPrivateData(mockDataWithUndefinedAddresses, MANAGING_OFFICER_OBJECT_MOCK_WITH_CH_REF);
      expect(address).toEqual(undefined);
    });

    describe('Test mapping for Corporate MO Principal Address', () => {

      test('Principal address is correctly mapped for Corporate Managing Officer', () => {
        const mockDataWithPrincipalAddressOnly: ManagingOfficerPrivateData[] = [
          {
            ...MOCK_MANAGING_OFFICERS_PRIVATE_DATA[0],
            residentialAddress: undefined,
            principalAddress: MOCKED_PRIVATE_ADDRESS,
            hashedId: 'mo-corporate-ch-ref',
          },
        ];

        mapCorporateMoPrivateAddress(mockDataWithPrincipalAddressOnly, MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF);
        expect(MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF.principal_address).toEqual(mapBOMOAddress(MOCKED_PRIVATE_ADDRESS));
      });
    });

    test('that undefined is returned when principal addresses is undefined', () => {
      const mockDataWithUndefinedAddresses: ManagingOfficerPrivateData[] =
        [
          {
            ...MOCK_MANAGING_OFFICERS_PRIVATE_DATA[0],
            principalAddress: undefined,
            hashedId: 'mo-corporate-ch-ref',
          },
        ];
      const address = mapIndividualMoPrivateData(mockDataWithUndefinedAddresses, MANAGING_OFFICER_CORPORATE_OBJECT_MOCK_WITH_CH_REF);
      expect(address).toEqual(undefined);
    });
  });
});
