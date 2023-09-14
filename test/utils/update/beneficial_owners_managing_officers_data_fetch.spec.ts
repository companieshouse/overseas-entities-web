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
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES, BO_INDIVIDUAL_MOCK_CEASED } from "../../__mocks__/get.company.psc.mock";
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';
import { logger } from '../../../src/utils/logger';

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("util beneficial owners managing officers data fetch", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    mockGetCompanyPscService.mockReset();
    mockGetCompanyOfficers.mockReset();
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
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("Should not set BO data in appData if no Company PSCs returned", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue({ "items": [] });
    await retrieveBeneficialOwners(req, appData);

    expect(appData.beneficial_owners_individual?.[0].first_name).toEqual(undefined);
    expect(appData.beneficial_owners_corporate?.[0].name).toEqual(undefined);
    expect(appData.beneficial_owners_government_or_public_authority?.[0].name).toEqual(undefined);
  });

  test("Should not set BO data in appData if no Company PSCs exist", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue(null);
    await retrieveBeneficialOwners(req, appData);

    expect(appData.beneficial_owners_individual?.[0].first_name).toEqual(undefined);
    expect(appData.beneficial_owners_corporate?.[0].name).toEqual(undefined);
    expect(appData.beneficial_owners_government_or_public_authority?.[0].name).toEqual(undefined);
  });

  test("Ceased on test ", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue( { "items": [ BO_INDIVIDUAL_MOCK_CEASED ] });
    await retrieveBeneficialOwners(req, appData);

    expect(appData.beneficial_owners_individual?.length).toEqual(undefined);
  });

  test("Should not set MO data in appData if no Company Officers returned", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyOfficers.mockReturnValue({ "items": [] });
    await retrieveBeneficialOwners(req, appData);

    expect(appData.managing_officers_individual?.[0].first_name).toEqual(undefined);
    expect(appData.managing_officers_corporate?.[0].name).toEqual(undefined);
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
