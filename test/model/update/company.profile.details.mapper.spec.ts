import { describe, expect, test } from '@jest/globals';
import { ApplicationData } from '../../../src/model';
import { getApplicationData, mapOverseasEntityToDTO } from "../../../src/utils/application.data";
import { getSessionRequestWithExtraData } from "../../__mocks__/session.mock";

describe("Test company profile details DTO",  () => {
  const session = getSessionRequestWithExtraData();
  const appData = getApplicationData(session) as ApplicationData;

  test(`That company details maps data correctly`, () => {
    expect(mapOverseasEntityToDTO(appData.company_profile_details)).resolves;
  });
});
