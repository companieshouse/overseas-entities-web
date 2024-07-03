import {
  fetchBeneficialOwnersPrivateData
} from "../../../src/utils/update/fetch.beneficial.owners.private.data";

jest.mock('../../../src/service/private.overseas.entity.details');
jest.mock('../../../src/utils/logger');
jest.mock("../../../src/utils/feature.flag" );

import { describe, expect, jest, test } from '@jest/globals';
import { Request } from "express";
import { ApplicationData } from '../../../src/model';
import { getBeneficialOwnersPrivateData } from '../../../src/service/private.overseas.entity.details';
import { logger } from '../../../src/utils/logger';
import {
  PRIVATE_BO_DATA_MOCK,
  PRIVATE_BO_ADDRESS
} from "../../__mocks__/get.beneficial.owner.private.data.mock";
import { FETCH_BO_APPLICATION_DATA_MOCK, FETCH_BO_APPLICATION_DATA_MOCK_NO_CH_REF } from "../../__mocks__/session.mock";

const mockGetBeneficialOwnersPrivateData = getBeneficialOwnersPrivateData as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("Test fetching and mapping BO private data", () => {
  let appData: ApplicationData, req: Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch and map BO private data", async () => {
    appData = FETCH_BO_APPLICATION_DATA_MOCK;

    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_DATA_MOCK);
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(appData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    const boIndividualResidentialAddress = appData.update?.review_beneficial_owners_individual?.[0].usual_residential_address;
    expect(boIndividualResidentialAddress?.property_name_number).toEqual(PRIVATE_BO_ADDRESS.premises);
    expect(boIndividualResidentialAddress?.line_1).toEqual(PRIVATE_BO_ADDRESS.addressLine1);
    expect(boIndividualResidentialAddress?.line_2).toEqual(PRIVATE_BO_ADDRESS.addressLine2);
    expect(boIndividualResidentialAddress?.town).toEqual(PRIVATE_BO_ADDRESS.locality);
    expect(boIndividualResidentialAddress?.postcode).toEqual(PRIVATE_BO_ADDRESS.postalCode);
    expect(boIndividualResidentialAddress?.county).toEqual(PRIVATE_BO_ADDRESS.region);
    expect(boIndividualResidentialAddress?.country).toEqual(PRIVATE_BO_ADDRESS.country);

    expect(appData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    const boCorporatePrincipalAddress = appData.update?.review_beneficial_owners_corporate?.[0].principal_address;
    expect(boCorporatePrincipalAddress?.property_name_number).toEqual(PRIVATE_BO_ADDRESS.premises);
    expect(boCorporatePrincipalAddress?.line_1).toEqual(PRIVATE_BO_ADDRESS.addressLine1);
    expect(boCorporatePrincipalAddress?.line_2).toEqual(PRIVATE_BO_ADDRESS.addressLine2);
    expect(boCorporatePrincipalAddress?.town).toEqual(PRIVATE_BO_ADDRESS.locality);
    expect(boCorporatePrincipalAddress?.postcode).toEqual(PRIVATE_BO_ADDRESS.postalCode);
    expect(boCorporatePrincipalAddress?.county).toEqual(PRIVATE_BO_ADDRESS.region);
    expect(boCorporatePrincipalAddress?.country).toEqual(PRIVATE_BO_ADDRESS.country);

    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
    const boGovPrincipalAddress = appData.update?.review_beneficial_owners_government_or_public_authority?.[0].principal_address;
    expect(boGovPrincipalAddress?.property_name_number).toEqual(PRIVATE_BO_ADDRESS.premises);
    expect(boGovPrincipalAddress?.line_1).toEqual(PRIVATE_BO_ADDRESS.addressLine1);
    expect(boGovPrincipalAddress?.line_2).toEqual(PRIVATE_BO_ADDRESS.addressLine2);
    expect(boGovPrincipalAddress?.town).toEqual(PRIVATE_BO_ADDRESS.locality);
    expect(boGovPrincipalAddress?.postcode).toEqual(PRIVATE_BO_ADDRESS.postalCode);
    expect(boGovPrincipalAddress?.county).toEqual(PRIVATE_BO_ADDRESS.region);
    expect(boGovPrincipalAddress?.country).toEqual(PRIVATE_BO_ADDRESS.country);
  });

  test("should throw error if BO private data retrieval fails", async () => {
    appData = {
      overseas_entity_id: '123',
      transaction_id: '345',
      entity_number: '1',
    };
    const mockError = new Error("An error occurred");
    mockGetBeneficialOwnersPrivateData.mockRejectedValue(mockError);

    await fetchBeneficialOwnersPrivateData(appData, req);

    expect(mockLoggerError).toHaveBeenCalledWith(
      req,
      `Private Beneficial Owner details could not be retrieved for overseas entity ${appData.entity_number}`
    );
  });

  test("should not fetch BO private data if email address is present", async () => {
    appData = {
      overseas_entity_id: '123',
      transaction_id: '345',
      entity_number: '1',
      entity: {
        email: 'test@test.com'
      },
    };
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(mockGetBeneficialOwnersPrivateData).not.toHaveBeenCalled();
    expect(appData.update?.review_beneficial_owners_individual?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toBeUndefined();
  });

  test("should not fetch BO private data if overseas entity id is undefined", async () => {
    appData = {
      transaction_id: '345',
      entity_number: '1',
      entity: {
        email: 'test@test.com'
      },
    };
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(mockGetBeneficialOwnersPrivateData).not.toHaveBeenCalled();
    expect(appData.update?.review_beneficial_owners_individual?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toBeUndefined();
  });

  test("should not fetch BO private data if transaction id is undefined", async () => {
    appData = {
      overseas_entity_id: '123',
      entity_number: '1',
      entity: {
        email: 'test@test.com'
      },
    };
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(mockGetBeneficialOwnersPrivateData).not.toHaveBeenCalled();
    expect(appData.update?.review_beneficial_owners_individual?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toBeUndefined();
  });

  test("should not map BO private data if retrieved BO private data is undefined", async () => {
    appData = {
      overseas_entity_id: '123',
      transaction_id: '345',
      entity_number: '1',
    };
    mockGetBeneficialOwnersPrivateData.mockReturnValue(undefined);
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(mockLoggerInfo).toHaveBeenCalledWith(`No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`);
    expect(appData.update?.review_beneficial_owners_individual?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toBeUndefined();
  });

  test("should handle undefined review_beneficial_owners_individual", async () => {
    const localAppData = {
      ...FETCH_BO_APPLICATION_DATA_MOCK,
      update: {
        ...FETCH_BO_APPLICATION_DATA_MOCK.update,
        review_beneficial_owners_individual: undefined
      }
    };

    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_DATA_MOCK);
    await fetchBeneficialOwnersPrivateData(localAppData, req);

    expect(localAppData.update?.review_beneficial_owners_individual).toBeUndefined();
    expect(localAppData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    expect(localAppData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
  });

  test("should handle undefined review_beneficial_owners_corporate", async () => {
    const localAppData = {
      ...FETCH_BO_APPLICATION_DATA_MOCK,
      update: {
        ...FETCH_BO_APPLICATION_DATA_MOCK.update,
        review_beneficial_owners_corporate: undefined
      }
    };

    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_DATA_MOCK);
    await fetchBeneficialOwnersPrivateData(localAppData, req);

    expect(localAppData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    expect(localAppData.update?.review_beneficial_owners_corporate).toBeUndefined();
    expect(localAppData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
  });

  test("should handle undefined review_beneficial_owners_government_or_public_authority", async () => {
    const localAppData = {
      ...FETCH_BO_APPLICATION_DATA_MOCK,
      update: {
        ...FETCH_BO_APPLICATION_DATA_MOCK.update,
        review_beneficial_owners_government_or_public_authority: undefined
      }
    };

    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_DATA_MOCK);
    await fetchBeneficialOwnersPrivateData(localAppData, req);

    expect(localAppData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    expect(localAppData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    expect(localAppData.update?.review_beneficial_owners_government_or_public_authority).toBeUndefined();
  });

  test("should not map BO private data if retrieved BO private data is empty", async () => {
    appData = {
      overseas_entity_id: '123',
      transaction_id: '345',
      entity_number: '1',
    };
    mockGetBeneficialOwnersPrivateData.mockReturnValue([]);
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(mockLoggerInfo).toHaveBeenCalledWith(`No private Beneficial Owner details were retrieved for overseas entity ${appData.entity_number}`);
    expect(appData.update?.review_beneficial_owners_individual?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toBeUndefined();
  });

  test("should not map BO private data if appdata does not already contain BO data", async () => {
    appData = {
      overseas_entity_id: '123',
      transaction_id: '345',
      entity_number: '1',
    };
    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_DATA_MOCK);
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(appData.update?.review_beneficial_owners_individual?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toBeUndefined();
  });

  test("should not map BO private data if existing BO data does not contain a ch reference", async () => {
    appData = FETCH_BO_APPLICATION_DATA_MOCK_NO_CH_REF;

    mockGetBeneficialOwnersPrivateData.mockReturnValue(PRIVATE_BO_DATA_MOCK);
    await fetchBeneficialOwnersPrivateData(appData, req);
    expect(appData.update?.review_beneficial_owners_individual?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_individual?.[0].usual_residential_address).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_corporate?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_corporate?.[0].principal_address).toBeUndefined();
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.length).toEqual(1);
    expect(appData.update?.review_beneficial_owners_government_or_public_authority?.[0].principal_address).toBeUndefined();
  });

});
