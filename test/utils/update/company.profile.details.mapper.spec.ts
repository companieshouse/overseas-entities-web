import { describe, expect, test } from '@jest/globals';
import { ApplicationData } from '../../../src/model';
import { ICompanyDetails } from '../../../src/model/company.profile.model';
import { getApplicationData,  } from "../../../src/utils/application.data";
import { mapCompanyProfileToOverseasEntityToDTOUpdate } from '../../../src/utils/update/company.profile.mapper.to.oversea.entity';
import { getSessionRequestWithExtraData, OVER_SEAS_ENTITY_MOCK_DATA } from "../../__mocks__/session.mock";

describe("Test company profile details DTO",  () => {
  const session = getSessionRequestWithExtraData();
  const appData = getApplicationData(session) as ApplicationData;

  test(`That company details maps data correctly`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(appData.company_profile_details)).resolves;
  });

  test(`That company details address is mapped correctly`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(appData.company_profile_details?.registeredOfficeAddress)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate({})).toThrowError;
  });

  test('data not provided, should return empty object', () => {
    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(undefined)).toEqual({});
  });

  test('map company details to overseas entity should return object', () => {
    const companyDetails = {
      companyName: "acme",
      dateOfCreation: "1872-06-26",
      registeredOfficeAddress: {
        line_1: "serviceAddressLine1",
        line_2: "serviceAddressLine2",
        town: "serviceTown",
        country: "serviceCountry",
        postcode: "SBY 2"
      },
      companyType: "registered-overseas-entity" as "type",
      jurisdiction: "europe-north",
      companyNumber: "0E746324"
    } as ICompanyDetails;


    expect(mapCompanyProfileToOverseasEntityToDTOUpdate(OVER_SEAS_ENTITY_MOCK_DATA)).toEqual({
      registeredOfficeAddress: companyDetails.registeredOfficeAddress,
      companyName: companyDetails.companyName,
      dateOfCreation: companyDetails.dateOfCreation,
      companyNumber: companyDetails.companyNumber
    });
  });
});
