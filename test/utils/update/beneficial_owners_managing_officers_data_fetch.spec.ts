jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock('../../../src/service/private.overseas.entity.details');
jest.mock('../../../src/utils/logger');

import { describe, expect, test } from '@jest/globals';
import { Request } from "express";
import { ApplicationData } from '../../../src/model';
import { retrieveBeneficialOwners, retrieveBoAndMoData } from '../../../src/utils/update/beneficial_owners_managing_officers_data_fetch';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import { getCompanyOfficers } from "../../../src/service/company.managing.officer.service";
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES } from "../../__mocks__/get.company.psc.mock";
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;

describe("util beneficial owners managing officers data fetch", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("retrieveBoAndMoData sets BO & MO data in appData.update, sets appData.update.bo_mo_data_fetched", async () => {
    appData = {};
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
    expect(appData.update?.review_managing_officers_individual?.length).toEqual(1);
    expect(appData.update?.review_managing_officers_corporate?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_individual?.some(item => item.id === "/company/OE111129/persons-with-significant-control/individual/RandomeaP1EB70SSD9SLmiK5Y")).toBe(true);
    expect(appData.update?.review_beneficial_owners_corporate?.some(item => item.id === "/company/OE111129/persons-with-significant-control/corporate-entity/OtherBOP1EB70SSD9SLmiK5Y")).toBe(true);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.some(item => item.id === "/company/OE111129/persons-with-significant-control/legal-person/RandomeaP1EB70SSD9SLmiK5Y")).toBe(true);
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("Should not set BO data in appData if no Company PSCs exist", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue({ items: [] });
    await retrieveBeneficialOwners(req, appData);

    expect(appData.update?.review_beneficial_owners_individual?.[0].first_name).toEqual(undefined);
    expect(appData.update?.review_beneficial_owners_corporate?.[0].name).toEqual(undefined);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.[0].name).toEqual(undefined);
  });

  test("test beneficial owners with ceasedOn date are not mapped", async () => {
    appData = {};

    const individualBoResignedOn2023 = { ...MOCK_GET_COMPANY_PSC_ALL_BO_TYPES.items[0], ceasedOn: "01/01/2023" };
    const corporateBoResignedOn2022 = { ...MOCK_GET_COMPANY_PSC_ALL_BO_TYPES.items[1], ceasedOn: "01/01/2022" };
    const governmentBoResignedOn2022 = { ...MOCK_GET_COMPANY_PSC_ALL_BO_TYPES.items[2], ceasedOn: "01/01/2022" };

    const modifiedPscs = [individualBoResignedOn2023, corporateBoResignedOn2022, governmentBoResignedOn2022];

    mockGetCompanyPscService.mockReturnValue({ items: modifiedPscs });
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);

    await retrieveBoAndMoData(req, appData);

    expect(appData.update?.review_beneficial_owners_individual?.some(item => item.id === "/company/OE111129/persons-with-significant-control/individual/RandomeaP1EB70SSD9SLmiK5Y")).toBe(false);
    expect(appData.update?.review_beneficial_owners_corporate?.some(item => item.id === "/company/OE111129/persons-with-significant-control/corporate-entity/OtherBOP1EB70SSD9SLmiK5Y")).toBe(false);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.some(item => item.id === "/company/OE111129/persons-with-significant-control/legal-person/RandomeaP1EB70SSD9SLmiK5Y")).toBe(false);
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
