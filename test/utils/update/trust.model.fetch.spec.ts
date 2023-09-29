import { retrieveTrustData } from "../../../src/utils/update/trust.model.fetch";
import { describe, expect, jest, test } from '@jest/globals';
import { Request } from "express";
import { getTrustData } from '../../../src/service/trust.data.service';
import { logger } from '../../../src/utils/logger';
import { Trust } from "../../../src/model/trust.model";
import { FETCH_TRUST_DATA_MOCK } from "./mocks";
import { FETCH_TRUST_APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";

jest.mock('../../../src/service/trust.data.service');
jest.mock('../../../src/utils/logger');

const mockGetTrustData = getTrustData as jest.Mock;
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

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(2);
    expect(appData.update?.review_trusts).toHaveLength(2);
    expect((appData.update?.review_trusts ?? [])[0]).toEqual({
      ch_reference: "12345678",
      creation_date_day: "1",
      creation_date_month: "1",
      creation_date_year: "2020",
      trust_id: "12345678",
      trust_name: "Test Trust",
      unable_to_obtain_all_trust_info: "No"
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
    expect(mockLoggerInfo).toBeCalledTimes(1);
  });

  test("should fetch and not map trust data data when trusts are empty", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockGetTrustData.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(1);
  });

  test("should not fetch and map trust data data when transactionId is undefined", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, transaction_id: undefined, update: { trust_data_fetched: false } };

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).not.toBeCalled();
    expect(mockLoggerError).toBeCalledTimes(1);
  });

  test("should not fetch and map trust data data when overseasEntityId is undefined", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, overseas_entity_id: undefined, update: { trust_data_fetched: false } };

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).not.toBeCalled();
    expect(mockLoggerError).toBeCalledTimes(1);
  });

});
