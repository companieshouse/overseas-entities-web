import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { describe, expect, test } from '@jest/globals';
import { mapCompanyProfileToOverseasEntity } from '../../../src/utils/update/company.profile.mapper.to.oversea.entity';
import { OVER_SEAS_ENTITY_MOCK_DATA } from "../../__mocks__/session.mock";

describe("Test company profile details DTO",  () => {

  test(`That company details maps data correctly`, () => {
    expect(mapCompanyProfileToOverseasEntity(OVER_SEAS_ENTITY_MOCK_DATA)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapCompanyProfileToOverseasEntity({} as CompanyProfile)).toThrowError;
  });

  test('map company details to overseas entity should return object', () => {
    const companyDetails = {
      companyName: "acme",
      companyNumber: "12345",
    };

    expect(mapCompanyProfileToOverseasEntity(companyDetails as CompanyProfile)).toEqual({
      name: companyDetails.companyName,
      email: "",
      incorporation_country: undefined,
      law_governed: "",
      legal_form: "",
      principal_address: {
        country: undefined,
        county: undefined,
        line_1: undefined,
        line_2: undefined,
        postcode: undefined,
        property_name_number: undefined,
        town: undefined,
      },
      public_register_jurisdiction: "",
      public_register_name: "",
      registration_number: "12345",
    });
  });
});
