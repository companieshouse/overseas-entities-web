jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock('../../../src/service/private.overseas.entity.details');
jest.mock('../../../src/utils/logger');

import { describe, expect, test } from '@jest/globals';
import { Request } from "express";
import { ApplicationData } from '../../../src/model';
import { retrieveBoAndMoData, retrieveManagingOfficers } from '../../../src/utils/update/beneficial_owners_managing_officers_data_fetch';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import { getCompanyOfficers } from "../../../src/service/company.managing.officer.service";
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES } from "../../__mocks__/get.company.psc.mock";
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';
import { getManagingOfficerPrivateData } from '../../../src/service/private.overseas.entity.details';
import { MOCK_GET_MO_PRIVATE_DATA } from '../../__mocks__/get.managing.officer.private.data.mock';
import { logger } from '../../../src/utils/logger';

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockGetManagingOfficerPrivateData = getManagingOfficerPrivateData as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("util beneficial owners managing officers data fetch", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    mockGetCompanyPscService.mockReset();
    mockGetCompanyOfficers.mockReset();
    mockGetManagingOfficerPrivateData.mockReset();
  });

  test("retrieveBoAndMoData sets BO & MO data in appData.update, sets appData.update.bo_mo_data_fetched", async () => {
    appData = {};
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetManagingOfficerPrivateData.mockReturnValue(MOCK_GET_MO_PRIVATE_DATA);
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
    expect(mockGetManagingOfficerPrivateData).not.toHaveBeenCalled();
  });

  test("retrieveBoAndMoData sets MO private data in appData", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetManagingOfficerPrivateData.mockReturnValue(MOCK_GET_MO_PRIVATE_DATA);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_managing_officers_individual?.length).toEqual(1);
    const usual_residential_address = appData.update?.review_managing_officers_individual?.[0].usual_residential_address;
    expect(usual_residential_address?.property_name_number).toEqual("URA 1");
    expect(usual_residential_address?.line_1).toEqual("URA Address line 1");
    expect(usual_residential_address?.line_2).toEqual("URA Address line 2");
    expect(usual_residential_address?.town).toEqual("URA Town");
    expect(usual_residential_address?.country).toEqual("URA Country");
    expect(usual_residential_address?.county).toEqual("URA County");
    expect(usual_residential_address?.postcode).toEqual("URA Postcode");
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("Should log info when transactionId and overseasEntityId are undefined", async () => {
    appData = { "transaction_id": undefined, "overseas_entity_id": undefined };
    await retrieveManagingOfficers(req, appData);
    expect(mockLoggerInfo).not.toHaveBeenCalled();
    expect(mockGetManagingOfficerPrivateData).not.toHaveBeenCalled();
  });

  test("Should log info when moPrivateData is empty", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456", "entity_number": "someEntityNumber" };
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetManagingOfficerPrivateData.mockReturnValue({ moPrivateData: [] });
    await retrieveManagingOfficers(req, appData);
    expect(mockLoggerInfo).toHaveBeenCalledWith(`No private Managing Officer details were retrieved for overseas entity ${appData.entity_number}`);
  });

  test("Should log info when moPrivateData is null", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456", "entity_number": "someEntityNumber" };
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetManagingOfficerPrivateData.mockReturnValue(null);
    await retrieveManagingOfficers(req, appData);
    expect(mockLoggerInfo).toHaveBeenCalledWith(`No private Managing Officer details were retrieved for overseas entity ${appData.entity_number}`);
  });

  test("Error thrown when retrieveManagingOfficers fails ", async () => {
    appData = {};
    const mockReq = {} as Request;
    const privateData = await retrieveManagingOfficers(mockReq, appData);
    expect(privateData).toThrowError;
  });

});
