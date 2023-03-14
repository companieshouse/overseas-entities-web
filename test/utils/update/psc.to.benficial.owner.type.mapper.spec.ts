import { CompanyPersonWithSignificantControl } from '@companieshouse/api-sdk-node/dist/services/company-psc/types';
import { NatureOfControlType, yesNoResponse } from '../../../src/model/data.types.model';
import { mapPscToBeneficialOwnerGov, mapPscToBeneficialOwnerOther, mapPscToBeneficialOwnerTypeIndividual } from '../../../src/utils/update/psc.to.beneficial.owner.type.mapper';
import { PSC_BENEFICIAL_OWNER_MOCK_DATA } from '../../__mocks__/session.mock';
import { pscMock } from './mocks';

describe("Test Mapping person of significant control to beneficial owner type", () => {

  test(`That person of significant control data is mapped correctly to beneficial owner individual`, () => {
    expect(mapPscToBeneficialOwnerTypeIndividual(PSC_BENEFICIAL_OWNER_MOCK_DATA)).resolves;
  });

  test(`That person of significant control data is mapped correctly to beneficial owner other`, () => {
    expect(mapPscToBeneficialOwnerOther(PSC_BENEFICIAL_OWNER_MOCK_DATA)).resolves;
  });

  test(`That person of significant control data is mapped correctly to beneficial owner gov`, () => {
    expect(mapPscToBeneficialOwnerGov(PSC_BENEFICIAL_OWNER_MOCK_DATA)).resolves;
  });

  test(`error is thrown when undefined data is parsed to beneficial owner individual data mapper`, () => {
    expect(mapPscToBeneficialOwnerTypeIndividual({} as CompanyPersonWithSignificantControl)).toThrowError;
  });

  test(`error is thrown when undefined data is parsed to beneficial owner coperate data mapper`, () => {
    expect(mapPscToBeneficialOwnerGov({} as CompanyPersonWithSignificantControl)).toThrowError;
  });

  test(`error is thrown when undefined data is parsed to beneficial owner other data mapper`, () => {
    expect(mapPscToBeneficialOwnerOther({} as CompanyPersonWithSignificantControl)).toThrowError;
  });

  test('map person of significant control to beneficial owner individual should return object', () => {
    expect(mapPscToBeneficialOwnerTypeIndividual(pscMock)).toEqual({
      id: "",
      link: {
        self: pscMock.links.self
      },
      date_of_birth: {
        day: pscMock.dateOfBirth.day,
        month: pscMock.dateOfBirth.month,
        year: pscMock.dateOfBirth.year
      },
      first_name: pscMock.nameElements.forename,
      last_name: pscMock.nameElements.surname,
      nationality: pscMock.nationality,
      second_nationality: undefined,
      start_date: pscMock.notifiedOn,
      non_legal_firm_members_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      trustees_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      beneficial_owner_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      is_service_address_same_as_usual_residential_address: yesNoResponse.Yes,
      service_address: {
        line_1: pscMock.address.address_line_1,
        line_2: pscMock.address.address_line_2,
        postcode: pscMock.address.postal_code,
        property_name_number: pscMock.address.premises,
        town: pscMock.address.locality,
        country: pscMock.address.region,
        county: pscMock.address.county,
      },
      usual_residential_address: undefined,
    });
  });

  test('map person of significant control to beneficial owner other  should return object', () => {
    expect(mapPscToBeneficialOwnerOther(pscMock)).toEqual({
      id: "",
      link: {
        self: pscMock.links.self
      },
      name: pscMock.name,
      start_date: pscMock.notifiedOn,
      non_legal_firm_members_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      trustees_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      beneficial_owner_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      is_service_address_same_as_principal_address: yesNoResponse.Yes,
      service_address: {
        line_1: pscMock.address.address_line_1,
        line_2: pscMock.address.address_line_2,
        postcode: pscMock.address.postal_code,
        property_name_number: pscMock.address.premises,
        town: pscMock.address.locality,
        country: pscMock.address.region,
        county: pscMock.address.county,
      },
      principal_address: {
        line_1: pscMock.address.address_line_1,
        line_2: pscMock.address.address_line_2,
        postcode: pscMock.address.postal_code,
        property_name_number: pscMock.address.premises,
        town: pscMock.address.locality,
        country: pscMock.address.region,
        county: pscMock.address.county,
      },
      law_governed: pscMock.identification?.legalAuthority,
      legal_form: pscMock.identification?.legalForm,
      public_register_name: pscMock.identification?.placeRegistered,
      registration_number: pscMock.identification?.registrationNumber,
      is_on_register_in_country_formed_in: undefined,

    });
  });

  test('map person of significant control to beneficial owner corporate (gov) should return object', () => {
    expect(mapPscToBeneficialOwnerGov(pscMock)).toEqual({
      id: "",
      link: {
        self: pscMock.links.self
      },
      name: pscMock.name,
      start_date: pscMock.notifiedOn,
      non_legal_firm_members_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      beneficial_owner_nature_of_control_types: NatureOfControlType.OVER_25_PERCENT_OF_SHARES,
      is_service_address_same_as_principal_address: yesNoResponse.No,
      service_address: {
        line_1: pscMock.address.address_line_1,
        line_2: pscMock.address.address_line_2,
        postcode: pscMock.address.postal_code,
        property_name_number: pscMock.address.premises,
        town: pscMock.address.locality,
        country: pscMock.address.region,
        county: pscMock.address.county,
      },
      principal_address: {},
      law_governed: pscMock.identification?.legalAuthority,
      legal_form: pscMock.identification?.legalForm,
    });
  });
});
