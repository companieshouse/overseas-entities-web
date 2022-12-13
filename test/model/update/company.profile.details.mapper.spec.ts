import { describe, expect, test } from '@jest/globals';
import { ApplicationData } from '../../../src/model';
import { getApplicationData, mapCompanyProfileToOverseasEntityToDTO } from "../../../src/utils/application.data";
import { getSessionRequestWithExtraData } from "../../__mocks__/session.mock";

describe("Test company profile details DTO",  () => {
  const session = getSessionRequestWithExtraData();
  const appData = getApplicationData(session) as ApplicationData;

  test(`That company details maps data correctly`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTO(appData.company_profile_details)).resolves;
  });

  test(`That company details address is mapped correctly`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTO(appData.company_profile_details?.companyAddress)).resolves;
  });

  test(`error is thrown when undefined data is parsed to data mapper`, () => {
    expect(mapCompanyProfileToOverseasEntityToDTO({})).toThrowError;
  });
});
