jest.mock('../../../src/service/company.managing.officer.service');
jest.mock('../../../src/service/persons.with.signficant.control.service');
jest.mock("../../../src/service/private.overseas.entity.details");
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/service/private.overseas.entity.details');
jest.mock('../../../src/utils/logger');

import { describe, expect, test } from '@jest/globals';
import { Request } from "express";
import { ApplicationData } from '../../../src/model';
import { retrieveBeneficialOwners, retrieveBoAndMoData, retrieveManagingOfficers } from '../../../src/utils/update/beneficial_owners_managing_officers_data_fetch';
import { getCompanyPsc } from "../../../src/service/persons.with.signficant.control.service";
import { getCompanyOfficers } from "../../../src/service/company.managing.officer.service";
import { MOCK_GET_COMPANY_PSC_ALL_BO_TYPES, MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV } from "../../__mocks__/get.company.psc.mock";
import { MOCK_GET_COMPANY_OFFICERS } from '../../__mocks__/get.company.officers.mock';
import { PRIVATE_BO_CORP_MOCK_DATA, PRIVATE_BO_GOV_MOCK_DATA, PRIVATE_BO_MOCK_DATA } from '../../__mocks__/session.mock';
import { getBeneficialOwnersPrivateData } from '../../../src/service/private.overseas.entity.details';
import { getManagingOfficersPrivateData } from '../../../src/service/private.overseas.entity.details';
import { MOCK_GET_MO_PRIVATE_DATA } from '../../__mocks__/get.managing.officer.private.data.mock';
import { logger } from '../../../src/utils/logger';

const mockGetCompanyPscService = getCompanyPsc as jest.Mock;
const mockGetCompanyOfficers = getCompanyOfficers as jest.Mock;
const mockGetBeneficialOwnersPrivateData = getBeneficialOwnersPrivateData as jest.Mock;
const mockGetManagingOfficerPrivateData = getManagingOfficersPrivateData as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("util beneficial owners managing officers data fetch", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    mockLoggerInfo.mockReset();
    mockLoggerError.mockReset();
    mockGetCompanyPscService.mockReset();
    mockGetCompanyOfficers.mockReset();
    mockGetBeneficialOwnersPrivateData.mockReset();
    mockGetManagingOfficerPrivateData.mockReset();
  });

  test("retrieveBoAndMoData sets BO & MO data in appData.update, sets appData.update.bo_mo_data_fetched", async () => {
    appData = {};
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetBeneficialOwnersPrivateData.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetManagingOfficerPrivateData.mockReturnValue(MOCK_GET_MO_PRIVATE_DATA);
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

  test("retrieveBoAndMoData sets Beneficial owner other private data in appData", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_MOCK_DATA);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    const principal_address = appData.update?.review_beneficial_owners_corporate?.[0].principal_address;
    expect(principal_address?.property_name_number).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.premises);
    expect(principal_address?.line_1).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.addressLine1);
    expect(principal_address?.line_2).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.addressLine2);
    expect(principal_address?.town).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.locality);
    expect(principal_address?.country).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.country);
    expect(principal_address?.county).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.region);
    expect(principal_address?.postcode).toEqual(PRIVATE_BO_CORP_MOCK_DATA.principalAddress?.postalCode);
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("retrieveBoAndMoData sets Beneficial owner gov private data in appData", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV.items[0].links.self = "GovRandomeaP1EB70SSD9SLmiK5Y";
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_MOCK_DATA);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
    const principal_address = appData.update?.review_beneficial_owners_government_or_public_authority?.[0].principal_address;
    expect(principal_address?.property_name_number).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.premises);
    expect(principal_address?.line_1).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.addressLine1);
    expect(principal_address?.line_2).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.addressLine2);
    expect(principal_address?.town).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.locality);
    expect(principal_address?.country).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.country);
    expect(principal_address?.county).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.region);
    expect(principal_address?.postcode).toEqual(PRIVATE_BO_GOV_MOCK_DATA.principalAddress?.postalCode);
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("retrieveBoAndMoData Beneficial owner gov private data returns undefined if no private data in appData", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV.items[0].links.self = "GovRandomeaP1EB70SSD9SLmiK5Y";
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_RESOURCE_FOR_GOV);
    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);
    mockGetBeneficialOwnersPrivateData.mockReturnValue([]);
    await retrieveBoAndMoData(req, appData);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
    const principal_address = appData.update?.review_beneficial_owners_government_or_public_authority?.[0].principal_address;
    expect(principal_address?.property_name_number).toEqual(undefined);
    expect(principal_address?.line_1).toEqual(undefined);
    expect(principal_address?.line_2).toEqual(undefined);
    expect(principal_address?.town).toEqual(undefined);
    expect(principal_address?.country).toEqual(undefined);
    expect(principal_address?.county).toEqual(undefined);
    expect(principal_address?.postcode).toEqual(undefined);
    expect(appData.update?.bo_mo_data_fetched).toBe(true);
  });

  test("Should not set BO data in appData if no Company PSCs returned", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue({ "items": [] });
    await retrieveBeneficialOwners(req, appData);

    expect(appData.beneficial_owners_individual?.[0].usual_residential_address?.line_1).toEqual(undefined);
    expect(appData.beneficial_owners_individual?.[0].usual_residential_address?.line_2).toEqual(undefined);
  });

  test("Should log info when boPrivateData is empty", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456", "entity_number": "someEntityNumber" };
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetBeneficialOwnersPrivateData.mockReturnValue([]);
    await retrieveBeneficialOwners(req, appData);
    expect(mockLoggerInfo).toHaveBeenCalledWith(`No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`);
  });

  test("Should log info when boPrivateData is null", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456", "entity_number": "someEntityNumber" };
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    mockGetBeneficialOwnersPrivateData.mockReturnValue(null);
    await retrieveBeneficialOwners(req, appData);
    expect(mockLoggerInfo).toHaveBeenCalledWith(`No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`);
  });

  test("should log error when getBeneficialOwnerPrivateData fails", async () => {
    appData = { "transaction_id": "123", "overseas_entity_id": "456" };
    mockGetCompanyPscService.mockReturnValue(MOCK_GET_COMPANY_PSC_ALL_BO_TYPES);
    await retrieveBoAndMoData(req, appData);

    const mockError = new Error("An error occurred");
    mockGetBeneficialOwnersPrivateData.mockRejectedValue(mockError);

    await retrieveBeneficialOwners(req, appData);

    expect(logger.errorRequest).toHaveBeenCalledWith(
      req,
      `No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`
    );
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

  test("Should not call getManagingOfficerPrivateData when transactionId and overseasEntityId are undefined", async () => {
    appData = { "transaction_id": undefined, "overseas_entity_id": undefined, "entity_number": "1234" };

    mockGetCompanyOfficers.mockReturnValue(MOCK_GET_COMPANY_OFFICERS);

    await retrieveManagingOfficers(req, appData);

    expect(mockGetCompanyOfficers).toHaveBeenCalled();
    expect(mockGetManagingOfficerPrivateData).not.toHaveBeenCalled();
    expect(mockLoggerInfo).toHaveBeenCalled();

  });

  test("Should not call getManagingOfficerPrivateData when no companyOfficers returned", async () => {
    appData = { "transaction_id": "id", "overseas_entity_id": "id", "entity_number": "1234" };

    mockGetCompanyOfficers.mockReturnValue(Promise.resolve({ items: [] }));

    await retrieveManagingOfficers(req, appData);

    expect(mockGetCompanyOfficers).toHaveBeenCalled();
    expect(mockGetManagingOfficerPrivateData).not.toHaveBeenCalled();
    expect(mockLoggerInfo).not.toHaveBeenCalled();
  });
});
