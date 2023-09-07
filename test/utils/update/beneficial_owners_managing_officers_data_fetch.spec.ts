jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock("../../../src/service/private.overseas.entity.details");

import { describe, expect, test } from '@jest/globals';
import { Request } from "express";
import { ApplicationData } from '../../../src/model';
import { getBoPrivateData, retrieveBoAndMoData } from '../../../src/utils/update/beneficial_owners_managing_officers_data_fetch';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import { getCompanyOfficers } from "../../../src/service/company.managing.officer.service";
import { getBeneficialOwnerPrivateData } from '../../../src/service/private.overseas.entity.details';
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES } from "../../__mocks__/get.company.psc.mock";
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';
import { logger } from '../../../src/utils/logger';
import { PRIVATE_BO_MOCK_DATA } from '../../__mocks__/session.mock';

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockGetBeneficialOwnersPrivateData = getBeneficialOwnerPrivateData as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("util beneficial owners managing officers data fetch", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
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
    expect(appData.update?.review_managing_officers_corporate?.length).toEqual(1);
    const usual_residential_address = appData.update?.review_beneficial_owners_individual?.[0].usual_residential_address;
    expect(usual_residential_address?.property_name_number).toEqual(undefined);
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("retrieveBoAndMoData sets BO private data in appData", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_MOCK_DATA);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    const usual_residential_address = appData.update?.review_beneficial_owners_individual?.[0].usual_residential_address;
    expect(usual_residential_address?.property_name_number).toEqual("REAGAN HICKMAN");
    expect(usual_residential_address?.line_1).toEqual("72 COWLEY AVENUE");
    expect(usual_residential_address?.line_2).toEqual("QUIA EX ESSE SINT EU");
    expect(usual_residential_address?.town).toEqual("AD EUM DEBITIS EST E");
    expect(usual_residential_address?.country).toEqual("KUWAIT");
    expect(usual_residential_address?.county).toEqual("ULLAM DOLORUM CUPIDA");
    expect(usual_residential_address?.postcode).toEqual("76022");
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("expect an error retrieving privateData if req is empty", async () => {
    appData = {};
    const mockReq = {} as Request;
    const privateData = await getBoPrivateData(mockReq, appData);
    expect(privateData).toThrowError;
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
