import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { describe, expect, test } from '@jest/globals';
import { ApplicationData } from '../../../src/model';
import { getApplicationData,  } from "../../../src/utils/application.data";
import { mapCompanyProfileToOverseasEntityToDTOUpdate } from '../../../src/utils/update/company.profile.mapper.to.oversea.entity';
import { getSessionRequestWithExtraData } from "../../__mocks__/session.mock";

describe("Test company profile details DTO",  () => {
  const session = getSessionRequestWithExtraData();
  const appData = getApplicationData(session) as ApplicationData;

  test(`That company details maps data correctly`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(appData.entity as CompanyProfile)).resolves;
  });

  test(`That company details address is mapped correctly`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(appData.entity?.principal_address as CompanyProfile)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate({} as CompanyProfile)).toThrowError;
  });

  test('map company details to overseas entity should return object', () => {
    const companyDetails = {
      companyName: "acme",
      companyNumber: "12345",
    };

    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(companyDetails as CompanyProfile)).toEqual({
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
