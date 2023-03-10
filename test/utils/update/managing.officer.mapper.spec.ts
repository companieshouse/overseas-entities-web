import { CompanyOfficer } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { mapToManagingOfficer, mapToManagingOfficerCorporate } from '../../../src/utils/update/managing.officer.mapper';
import { MANAGING_OFFICER_MOCK_MAP_DATA } from '../../__mocks__/session.mock';
import { managingOfficerMock } from './mocks';

const names = managingOfficerMock.name.split(" ");

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
      id: undefined,
      links: {
        self: undefined
      },
      first_name: names[0],
      last_name: names[1],
      has_former_names: yesNoResponse.Yes,
      former_names: undefined,
      date_of_birth: {
        day: managingOfficerMock.dateOfBirth?.day,
        month: managingOfficerMock.dateOfBirth?.month,
        year: managingOfficerMock.dateOfBirth?.year
      },
      nationality: managingOfficerMock.nationality,
      second_nationality: undefined,
      // appointed_on: managingOfficerMock.appointedOn,
      usual_residential_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.addressLine1,
        line_2: managingOfficerMock.address.addressLine2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postalCode,
      },
      is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
      service_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.addressLine1,
        line_2: managingOfficerMock.address.addressLine2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postalCode,
      },
      occupation: managingOfficerMock.occupation,
      role_and_responsibilities: managingOfficerMock.officerRole
    });
  });

  test('map officer data to managing officer corporate should return object', () => {
    expect(mapToManagingOfficerCorporate(managingOfficerMock)).toEqual({
      id: undefined,
      links: {
        self: undefined
      },
      name: managingOfficerMock.name,
      principal_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.addressLine1,
        line_2: managingOfficerMock.address.addressLine2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postalCode,
      },
      is_service_address_same_as_principal_address: yesNoResponse.Yes,
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
      is_on_register_in_country_formed_in: undefined,
      public_register_name: managingOfficerMock.identification?.placeRegistered,
      registration_number: managingOfficerMock.identification?.registrationNumber,
      role_and_responsibilities: managingOfficerMock.officerRole,
      contact_full_name: undefined,
      contact_email: undefined
    });
  });
});
