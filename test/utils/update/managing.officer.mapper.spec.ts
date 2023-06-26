import { CompanyOfficer } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { mapToManagingOfficer, mapToManagingOfficerCorporate, getFormerNames } from '../../../src/utils/update/managing.officer.mapper';
import { MANAGING_OFFICER_MOCK_MAP_DATA, UPDATE_MANAGING_OFFICER_DUAL_NATIONALITY_MOCK, UPDATE_MANAGING_OFFICER_SINGLE_NATIONALITY_MOCK } from '../../__mocks__/session.mock';
import { managingOfficerMock, managingOfficerMockDualNationality } from './mocks';

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
      is_service_address_same_as_principal_address: yesNoResponse.No,
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
      role_and_responsibilities: managingOfficerMock.officerRole,
    });
  });
});
