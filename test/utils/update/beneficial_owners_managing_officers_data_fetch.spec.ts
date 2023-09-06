jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock("../../../src/service/private.overseas.entity.details");

import { describe, expect, test } from '@jest/globals';
import { Request } from "express";
import { ApplicationData } from '../../../src/model';
import { retrieveBoAndMoData } from '../../../src/utils/update/beneficial_owners_managing_officers_data_fetch';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import { getCompanyOfficers } from "../../../src/service/company.managing.officer.service";
import { getBeneficialOwnerPrivateData } from '../../../src/service/private.overseas.entity.details';
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES } from "../../__mocks__/get.company.psc.mock";
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockGetBeneficialOwnersPrivateData = getBeneficialOwnerPrivateData as jest.Mock;

describe("util beneficial owners managing officers data fetch", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    mockGetCompanyPscService.mockReset();
    mockGetCompanyOfficers.mockReset();
    mockGetBeneficialOwnersPrivateData.mockReset();
  });

  test("retrieveBoAndMoData sets BO & MO data in appData.update, sets appData.update.bo_mo_data_fetched", async () => {
    appData = {};
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetBeneficialOwnersPrivateData.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
    expect(appData.update?.review_managing_officers_individual?.length).toEqual(1);
    expect(appData.update?.review_managing_officers_corporate?.length).toEqual(1);
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("data fetch does not occur if appData.update.bo_mo_data_fetched set to true", () => {
    appData = {
      update: {
        bo_mo_data_fetched: true
      }
    };
    retrieveBoAndMoData(req, appData);
    expect(mockGetCompanyPscService).not.toHaveBeenCalled();
    expect(mockGetCompanyOfficers).not.toHaveBeenCalled();
  });
});
