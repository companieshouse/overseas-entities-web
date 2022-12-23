import { CompanyProfile } from '@companieshouse/api-sdk-node/dist/services/company-profile/types';
import { describe, expect, test } from '@jest/globals';
import { mapCompanyProfileToOverseasEntity } from '../../../src/utils/update/company.profile.mapper.to.oversea.entity';
import { OVER_SEAS_ENTITY_MOCK_DATA } from "../../__mocks__/session.mock";
import { yesNoResponse } from "../../../src/model/data.types.model";

describe("Test company profile details mapping", () => {

  test(`That company details maps data correctly`, () => {
    expect(mapCompanyProfileToOverseasEntity(OVER_SEAS_ENTITY_MOCK_DATA)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapCompanyProfileToOverseasEntity({} as CompanyProfile)).toThrowError;
  });

  test('map company details to overseas entity should return object', () => {
    const companyDetails: CompanyProfile = {
      companyName: "acme",
      companyNumber: "12345",
      companyStatus: "trading",
      jurisdiction: "Australia",
      companyStatusDetail: '',
      dateOfCreation: '1/1/2000',
      sicCodes: [],
      hasBeenLiquidated: false,
      type: 'Ltd',
      hasCharges: false,
      hasInsolvencyHistory: false,
      registeredOfficeAddress: {
        addressLineOne: "1",
        addressLineTwo: "Victoria Park",
        careOf: "",
        country: "",
        locality: "",
        poBox: "",
        premises: "",
        postalCode: "",
        region: ""
      },
      serviceAddress: {
        addressLineOne: "100 Boulevard",
        addressLineTwo: "of life",
        careOf: "",
        country: "",
        locality: "",
        poBox: "",
        premises: "",
        postalCode: "",
        region: ""
      },
      accounts: {
        nextAccounts: {
          periodEndOn: "end",
          periodStartOn: "start"
        },
        nextDue: "due",
        overdue: false
      },
      links: {}
    };

    expect(mapCompanyProfileToOverseasEntity(companyDetails as CompanyProfile)).toEqual({
      name: companyDetails.companyName,
      email: "",
      registration_number: companyDetails.companyNumber,
      law_governed: companyDetails.foreignCompanyDetails?.governedBy,
      legal_form: companyDetails.foreignCompanyDetails?.legalForm,
      incorporation_country: companyDetails.jurisdiction,
      principal_address: {
        country: companyDetails.registeredOfficeAddress.country,
        county: companyDetails.registeredOfficeAddress.region,
        line_1: companyDetails.registeredOfficeAddress.addressLineOne,
        line_2: companyDetails.registeredOfficeAddress.addressLineTwo,
        postcode: companyDetails.registeredOfficeAddress.postalCode,
        property_name_number: companyDetails.registeredOfficeAddress.premises,
        town: companyDetails.registeredOfficeAddress?.locality,
      },
      service_address: {
        country: companyDetails.serviceAddress?.country,
        county: companyDetails.serviceAddress?.region,
        line_1: companyDetails.serviceAddress?.addressLineOne,
        line_2: companyDetails.serviceAddress?.addressLineTwo,
        postcode: companyDetails.serviceAddress?.postalCode,
        property_name_number: companyDetails.serviceAddress?.premises,
        town: companyDetails.serviceAddress?.locality,
      },
      public_register_jurisdiction: companyDetails.foreignCompanyDetails?.originatingRegistry?.country,
      public_register_name: companyDetails.foreignCompanyDetails?.originatingRegistry?.country,
      is_on_register_in_country_formed_in: companyDetails.isOnRegisterInCountryFormedIn ? yesNoResponse.Yes : yesNoResponse.No,
      is_service_address_same_as_principal_address: yesNoResponse.No
    });
  });
});
