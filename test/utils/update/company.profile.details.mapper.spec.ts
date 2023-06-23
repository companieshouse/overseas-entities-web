import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { describe, expect, test } from '@jest/globals';
import { mapCompanyProfileToOverseasEntity } from '../../../src/utils/update/company.profile.mapper.to.overseas.entity';
import { OVER_SEAS_ENTITY_MOCK_DATA } from "../../__mocks__/session.mock";
import { yesNoResponse } from "../../../src/model/data.types.model";
import { companyDetailsMock } from './mocks';
import { mapAddress, splitOriginatingRegistryName } from '../../../src/utils/update/mapper.utils';

describe("Test company profile details mapping", () => {

  test(`That company details maps data correctly`, () => {
    expect(mapCompanyProfileToOverseasEntity(OVER_SEAS_ENTITY_MOCK_DATA)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapCompanyProfileToOverseasEntity({} as CompanyProfile)).toThrowError;
  });

  test('map company details to overseas entity should return object', () => {
    const publicRegister = splitOriginatingRegistryName(companyDetailsMock.foreignCompanyDetails?.originatingRegistry?.name as string);

    expect(mapCompanyProfileToOverseasEntity(companyDetailsMock)).toEqual({
      email: "",
      law_governed: companyDetailsMock.foreignCompanyDetails?.governedBy,
      legal_form: companyDetailsMock.foreignCompanyDetails?.legalForm,
      registration_number: companyDetailsMock.foreignCompanyDetails?.registrationNumber,
      incorporation_country: companyDetailsMock.foreignCompanyDetails?.originatingRegistry?.country,
      principal_address: {
        country: companyDetailsMock.registeredOfficeAddress.country,
        county: companyDetailsMock.registeredOfficeAddress.region,
        line_1: companyDetailsMock.registeredOfficeAddress.addressLineOne,
        line_2: companyDetailsMock.registeredOfficeAddress.addressLineTwo,
        postcode: companyDetailsMock.registeredOfficeAddress.postalCode,
        property_name_number: companyDetailsMock.registeredOfficeAddress.premises,
        town: companyDetailsMock.registeredOfficeAddress?.locality,
      },
      service_address: {
        country: companyDetailsMock.serviceAddress?.country,
        county: companyDetailsMock.serviceAddress?.region,
        line_1: companyDetailsMock.serviceAddress?.addressLineOne,
        line_2: companyDetailsMock.serviceAddress?.addressLineTwo,
        postcode: companyDetailsMock.serviceAddress?.postalCode,
        property_name_number: companyDetailsMock.serviceAddress?.premises,
        town: companyDetailsMock.serviceAddress?.locality,
      },
      public_register_jurisdiction: publicRegister[1],
      public_register_name: publicRegister[0],
      is_on_register_in_country_formed_in: companyDetailsMock.isOnRegisterInCountryFormedIn ? yesNoResponse.Yes : yesNoResponse.No,
      is_service_address_same_as_principal_address: yesNoResponse.No
    });
  });

  test(`A null OE address should map to be empty`, () => {
    expect(mapAddress(undefined)).toEqual({});
  });

  test(`A OE address should be mapped`, () => {
    expect(mapAddress(companyDetailsMock.serviceAddress)).toEqual({
      country: companyDetailsMock.serviceAddress?.country,
      county: companyDetailsMock.serviceAddress?.region,
      line_1: companyDetailsMock.serviceAddress?.addressLineOne,
      line_2: companyDetailsMock.serviceAddress?.addressLineTwo,
      postcode: companyDetailsMock.serviceAddress?.postalCode,
      property_name_number: companyDetailsMock.serviceAddress?.premises,
      town: companyDetailsMock.serviceAddress?.locality
    });
  });

});
