import { CompanyOfficerResource } from '@companieshouse/api-sdk-node/dist/services/company-officers/types';
import { yesNoResponse } from '../../../src/model/data.types.model';
import { mapToManagingOfficer, mapToManagingOfficerCorporate, splitNames, getFormerNames } from '../../../src/utils/update/managing.officer.mapper';
import { MANAGING_OFFICER_MOCK_MAP_DATA } from '../../__mocks__/session.mock';
import { managingOfficerMock } from './mocks';

describe("Test mapping to managing officer", () => {

  test(`That officer data is mapped correctly to managing officer`, () => {
    expect(mapToManagingOfficer(MANAGING_OFFICER_MOCK_MAP_DATA)).resolves;
  });

  test(`That officer data is mapped correctly to managing officer corporate`, () => {
    expect(mapToManagingOfficerCorporate(MANAGING_OFFICER_MOCK_MAP_DATA)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapToManagingOfficer({} as CompanyOfficerResource)).toThrowError;
  });

  test(`error is thrown when undefined data is parsed to data mapper (corporate)`, () => {
    expect(mapToManagingOfficerCorporate({} as CompanyOfficerResource)).toThrowError;
  });

  test('map officer data to managing officer should return object', () => {
    expect(mapToManagingOfficer(managingOfficerMock)).toEqual({
      id: undefined,
      first_name: splitNames(managingOfficerMock.name)[0],
      last_name: splitNames(managingOfficerMock.name)[1],
      has_former_names: yesNoResponse.Yes,
      former_names: getFormerNames(managingOfficerMock.former_names),
      date_of_birth: {
        day: managingOfficerMock.date_of_birth?.day,
        month: managingOfficerMock.date_of_birth?.month,
        year: managingOfficerMock.date_of_birth?.year
      },
      nationality: managingOfficerMock.nationality,
      // appointed_on: managingOfficerMock.appointedOn,
      usual_residential_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.address_line_1,
        line_2: managingOfficerMock.address.address_line_2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postal_code,
      },
      is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
      service_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.address_line_1,
        line_2: managingOfficerMock.address.address_line_2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postal_code,
      },
      occupation: managingOfficerMock.occupation,
      role_and_responsibilities: managingOfficerMock.officer_role
    });
  });

  test('map officer data to managing officer corporate should return object', () => {
    expect(mapToManagingOfficerCorporate(managingOfficerMock)).toEqual({
      id: undefined,
      name: managingOfficerMock.name,
      principal_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.address_line_1,
        line_2: managingOfficerMock.address.address_line_2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postal_code,
      },
      is_service_address_same_as_principal_address: yesNoResponse.Yes,
      service_address: {
        property_name_number: managingOfficerMock.address.premises,
        line_1: managingOfficerMock.address.address_line_1,
        line_2: managingOfficerMock.address.address_line_2,
        town: managingOfficerMock.address.locality,
        county: managingOfficerMock.address.region,
        country: managingOfficerMock.address.country,
        postcode: managingOfficerMock.address.postal_code,
      },
      legal_form: managingOfficerMock.identification?.legal_form,
      law_governed: managingOfficerMock.identification?.legal_authority,
      is_on_register_in_country_formed_in: undefined,
      public_register_name: managingOfficerMock.identification?.place_registered,
      registration_number: managingOfficerMock.identification?.registration_number,
      role_and_responsibilities: managingOfficerMock.officer_role,
    });
  });
});
