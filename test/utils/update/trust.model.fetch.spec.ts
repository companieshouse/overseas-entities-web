import { retrieveTrustData, mapTrustData } from "../../../src/utils/update/trust.model.fetch";
import { describe, expect, jest, test } from '@jest/globals';
import {
  getTrustData,
  getIndividualTrustees,
  getCorporateTrustees,
  getTrustLinks
} from '../../../src/service/trust.data.service';
import { logger } from '../../../src/utils/logger';
import { Trust } from "../../../src/model/trust.model";
import {
  FETCH_CORPORATE_TRUSTEE_DATA_MOCK,
  FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK,
  FETCH_TRUST_DATA_MOCK,
  MAPPED_FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK,
  MAPPED_FETCHED_HISTORICAL_INDIVIDUAL_DATA_MOCK,
  MAPPED_FETCH_CORPORATE_TRUSTEE_DATA_MOCK,
  MAPPED_FETCHED_HISTORICAL_CORPORATE_DATA_MOCK
} from "./mocks";
import { FETCH_TRUST_APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { TrustData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { ApplicationData } from "../../../src/model";
import { Request } from "express";

jest.mock('../../../src/service/trust.data.service');
jest.mock('../../../src/utils/logger');

const mockGetTrustData = getTrustData as jest.Mock;
const mockGetIndividualTrustees = getIndividualTrustees as jest.Mock;
const mockGetCorporateTrustees = getCorporateTrustees as jest.Mock;
const mockGetTrustLinks = getTrustLinks as jest.Mock;
const mockLoggerInfo = logger.info as jest.Mock;
const mockLoggerError = logger.errorRequest as jest.Mock;

describe("Test fetching and mapping of Trust data", () => {
  let req: Request;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should fetch and map trust data data", async () => {
    const appData = FETCH_TRUST_APPLICATION_DATA_MOCK;

    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(7);
    expect(appData.update?.review_trusts).toHaveLength(2);
    expect((appData.update?.review_trusts ?? [])[0]).toEqual({
      ch_reference: "12345678",
      creation_date_day: "1",
      creation_date_month: "1",
      creation_date_year: "2020",
      trust_id: "1",
      trust_name: "Test Trust",
      unable_to_obtain_all_trust_info: "No",
      INDIVIDUALS: [],
      CORPORATES: [],
      HISTORICAL_BO: []
    } as Trust);
  });

  test("should not fetch and map trust data data when already fetched", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: true } };

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).not.toBeCalled();
    expect(mockLoggerInfo).not.toBeCalled();
  });

  test("should fetch and not map trust data data when trusts are undefined", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockGetTrustData.mockResolvedValue(undefined);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(2);
  });

  test("should fetch and not map trust data data when trusts are empty", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockGetTrustData.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(2);
  });

  test("should not fetch and map trust data data when transactionId is undefined", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, transaction_id: undefined, update: { trust_data_fetched: false } };

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).not.toBeCalled();
    expect(mockLoggerError).toBeCalledTimes(2);
  });

  test("should not fetch and map trust data data when overseasEntityId is undefined", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, overseas_entity_id: undefined, update: { trust_data_fetched: false } };

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).not.toBeCalled();
    expect(mockLoggerError).toBeCalledTimes(2);
  });

  test("mapTrustData without date of birth", () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { review_trusts: [] } };
    const trustData = { ...FETCH_TRUST_DATA_MOCK[0], creationDate: undefined } as unknown as TrustData;
    const trust: Trust = {
      trust_id: "1",
      ch_reference: trustData.trustId,
      trust_name: trustData.trustName,
      creation_date_day: "",
      creation_date_month: "",
      creation_date_year: "",
      unable_to_obtain_all_trust_info: trustData.unableToObtainAllTrustInfo ? "Yes" : "No",
      INDIVIDUALS: [],
      CORPORATES: [],
      HISTORICAL_BO: []
    };

    mapTrustData(trustData, appData);

    expect(appData.update?.review_trusts).toHaveLength(1);
    expect((appData.update?.review_trusts ?? [])[0]).toEqual(trust);
  });

  test("mapTrustData should not push result if no review list", () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { review_trusts: undefined } };
    const trustData = { ...FETCH_TRUST_DATA_MOCK[0] };

    mapTrustData(trustData, appData);

    expect(appData.update?.review_trusts).toEqual(undefined);
  });

  test("mapTrustData should not push result if no update app data", () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: undefined };
    const trustData = { ...FETCH_TRUST_DATA_MOCK[0] };

    mapTrustData(trustData, appData);

    expect(appData.update).toEqual(undefined);
  });

  test("should fetch and map individual trustees", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValueOnce(FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(8);
    expect(appData.update?.review_trusts).toHaveLength(2);
    const individualTrustees = ((appData.update?.review_trusts ?? [])[0]).INDIVIDUALS;
    expect(individualTrustees).toHaveLength(1);
    const individualTrustee = (individualTrustees ?? [])[0];
    expect(individualTrustee).toEqual(MAPPED_FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK);

    const historicalTrustees = ((appData.update?.review_trusts ?? [])[0]).HISTORICAL_BO;
    expect(historicalTrustees).toHaveLength(1);
    const historicalTrustee = (historicalTrustees ?? [])[0];
    expect(historicalTrustee).toEqual(MAPPED_FETCHED_HISTORICAL_INDIVIDUAL_DATA_MOCK);
  });

  test("should fetch and map corporate trustees", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValueOnce(FETCH_CORPORATE_TRUSTEE_DATA_MOCK);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(8);
    expect(appData.update?.review_trusts).toHaveLength(2);
    const corporateTrustees = ((appData.update?.review_trusts ?? [])[0]).CORPORATES;
    expect(corporateTrustees).toHaveLength(1);
    const corporateTrustee = (corporateTrustees ?? [])[0];
    expect(corporateTrustee).toEqual(MAPPED_FETCH_CORPORATE_TRUSTEE_DATA_MOCK);
    const historicalTrustees = ((appData.update?.review_trusts ?? [])[0]).HISTORICAL_BO;
    expect(historicalTrustees).toHaveLength(1);
    const historicalTrustee = (historicalTrustees ?? [])[0];
    expect(historicalTrustee).toEqual(MAPPED_FETCHED_HISTORICAL_CORPORATE_DATA_MOCK);
  });
});
