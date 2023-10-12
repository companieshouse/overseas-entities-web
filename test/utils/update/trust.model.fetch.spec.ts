import { retrieveTrustData, mapTrustData, mapIndividualTrusteeData, mapCorporateTrusteeData, mapTrustLink } from "../../../src/utils/update/trust.model.fetch";
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
  MAPPED_FETCH_SECOND_INDIVIDUAL_TRUSTEE_DATA_MOCK,
  MAPPED_FETCH_HISTORICAL_INDIVIDUAL_DATA_MOCK,
  MAPPED_FETCH_CORPORATE_TRUSTEE_DATA_MOCK,
  MAPPED_FETCH_HISTORICAL_CORPORATE_DATA_MOCK,
  MAPPED_FETCH_SECOND_CORPORATE_TRUSTEE_DATA_MOCK,
  MAPPED_FETCH_THIRD_CORPORATE_TRUSTEE_DATA_MOCK,
  TRUST_LINKS_DATA_MOCK,
  BO_TRUST_LINKS_DATA_MOCK
} from "./mocks";
import { FETCH_TRUST_APPLICATION_DATA_MOCK } from "../../__mocks__/session.mock";
import { CorporateTrusteeData, IndividualTrusteeData, TrustData } from "@companieshouse/api-sdk-node/dist/services/overseas-entities/types";
import { ApplicationData } from "../../../src/model";
import { Request } from "express";
import { isActiveFeature } from "../../../src/utils/feature.flag";

jest.mock('../../../src/service/trust.data.service');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/utils/feature.flag');

const mockIsActiveFeature = isActiveFeature as jest.Mock;
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

    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(5);
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
    expect((appData.update?.review_trusts ?? [])[1]).toEqual({
      ch_reference: "87654321",
      creation_date_day: "2",
      creation_date_month: "2",
      creation_date_year: "2020",
      trust_id: "2",
      trust_name: "Test Trust 2",
      unable_to_obtain_all_trust_info: "Yes",
      INDIVIDUALS: [],
      CORPORATES: [],
      HISTORICAL_BO: []
    } as Trust);
  });

  test("should fetch and not map a ceased trust", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false, review_trusts: undefined } };

    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue([
      {
        trustName: "Test Trust A",
        hashedTrustId: "87654321",
        creationDate: "2010-01-01",
        ceasedDate: "2020-02-02",
        unableToObtainAllTrustInfoIndicator: true
      }
    ]);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(1);
    expect(appData.update?.review_trusts).toEqual([]);
  });

  test("should fetch and map a trust with empty ceased date", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false, review_trusts: undefined } };

    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue([
      {
        trustName: "Test Trust A",
        hashedTrustId: "87654321",
        creationDate: "2010-01-01",
        ceasedDate: "",
        unableToObtainAllTrustInfoIndicator: true
      }
    ]);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(3);
    expect(appData.update?.review_trusts).toEqual([{
      "ch_reference": "87654321",
      "creation_date_day": "1",
      "creation_date_month": "1",
      "creation_date_year": "2010",
      "trust_id": "1",
      "trust_name": "Test Trust A",
      "unable_to_obtain_all_trust_info": "Yes",
      "CORPORATES": [],
      "HISTORICAL_BO": [],
      "INDIVIDUALS": []
    }]);
  });

  test("should not fetch and map trust data data when already fetched", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: true } };

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).not.toBeCalled();
    expect(mockLoggerInfo).not.toBeCalled();
  });

  test("should fetch and not map trust data data when trusts are undefined", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(undefined);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(2);
  });

  test("should fetch and not map trust data data when trusts are empty", async () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
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

  test("mapTrustData without creation date to have default day/month/year", () => {
    const appData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { review_trusts: [] } };
    const trustData = { ...FETCH_TRUST_DATA_MOCK[0], creationDate: undefined } as unknown as TrustData;
    const trust: Trust = {
      trust_id: "1",
      ch_reference: trustData.hashedTrustId,
      trust_name: trustData.trustName,
      creation_date_day: "",
      creation_date_month: "",
      creation_date_year: "",
      unable_to_obtain_all_trust_info: trustData.unableToObtainAllTrustInfoIndicator ? "Yes" : "No",
      INDIVIDUALS: [],
      CORPORATES: [],
      HISTORICAL_BO: []
    };

    mapTrustData(trustData, appData);

    expect(appData.update?.review_trusts).toHaveLength(1);
    expect((appData.update?.review_trusts ?? [])[0]).toEqual(trust);
  });

  test("mapTrustData should not push any result if no review list", () => {
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
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue(FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(3);
    expect(appData.update?.review_trusts).toHaveLength(2);
    const individualTrustees = ((appData.update?.review_trusts ?? [])[0]).INDIVIDUALS;
    expect(individualTrustees).toHaveLength(2);
    const individualTrustee = (individualTrustees ?? [])[0];
    expect(individualTrustee).toEqual(MAPPED_FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK);

    const secondIndividualTrustee = (individualTrustees ?? [])[1];
    expect(secondIndividualTrustee).toEqual(MAPPED_FETCH_SECOND_INDIVIDUAL_TRUSTEE_DATA_MOCK);

    const historicalTrustees = ((appData.update?.review_trusts ?? [])[0]).HISTORICAL_BO;
    expect(historicalTrustees).toHaveLength(1);
    const historicalTrustee = (historicalTrustees ?? [])[0];
    expect(historicalTrustee).toEqual(MAPPED_FETCH_HISTORICAL_INDIVIDUAL_DATA_MOCK);
  });

  test("should fetch and map corporate trustees", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue(FETCH_CORPORATE_TRUSTEE_DATA_MOCK);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(3);
    expect(appData.update?.review_trusts).toHaveLength(2);
    const corporateTrustees = ((appData.update?.review_trusts ?? [])[0]).CORPORATES;
    expect(corporateTrustees).toHaveLength(3);
    const corporateTrustee = (corporateTrustees ?? [])[0];
    expect(corporateTrustee).toEqual(MAPPED_FETCH_CORPORATE_TRUSTEE_DATA_MOCK);
    const secondCorporateTrustee = (corporateTrustees ?? [])[1];
    expect(secondCorporateTrustee).toEqual(MAPPED_FETCH_SECOND_CORPORATE_TRUSTEE_DATA_MOCK);
    const thirdCorporateTrustee = (corporateTrustees ?? [])[2];
    expect(thirdCorporateTrustee).toEqual(MAPPED_FETCH_THIRD_CORPORATE_TRUSTEE_DATA_MOCK);
    const historicalTrustees = ((appData.update?.review_trusts ?? [])[0]).HISTORICAL_BO;
    expect(historicalTrustees).toHaveLength(1);
    const historicalTrustee = (historicalTrustees ?? [])[0];
    expect(historicalTrustee).toEqual(MAPPED_FETCH_HISTORICAL_CORPORATE_DATA_MOCK);
  });

  test("should fetch and map trust links for indivdual BOs", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue(TRUST_LINKS_DATA_MOCK);

    appData.beneficial_owners_individual = BO_TRUST_LINKS_DATA_MOCK;
    appData.beneficial_owners_corporate = undefined;

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(4);
    expect(appData.update?.review_trusts).toHaveLength(2);

    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(["1", "2"]);
    expect(appData.beneficial_owners_individual[1].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_individual[2].trust_ids).toEqual(["2"]);
    expect(appData.beneficial_owners_corporate).toEqual(undefined);
  });

  test("should fetch and map trust links for corporate BOs", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue(TRUST_LINKS_DATA_MOCK);

    appData.beneficial_owners_individual = undefined;
    appData.beneficial_owners_corporate = BO_TRUST_LINKS_DATA_MOCK;
    appData.beneficial_owners_corporate.forEach(bo => bo.trust_ids = undefined);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(4);
    expect(appData.update?.review_trusts).toHaveLength(2);

    expect(appData.beneficial_owners_corporate[0].trust_ids).toEqual(["1", "2"]);
    expect(appData.beneficial_owners_corporate[1].trust_ids).toEqual(undefined);
    expect(appData.beneficial_owners_corporate[2].trust_ids).toEqual(["2"]);
    expect(appData.beneficial_owners_individual).toEqual(undefined);
  });

  test("should not fetch and map individual trustees when feature disabled", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(true);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValueOnce(FETCH_INDIVIDUAL_TRUSTEE_DATA_MOCK);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(0);
    expect(appData.update?.review_trusts).toHaveLength(2);
    expect(appData.beneficial_owners_individual).toEqual(undefined);
  });

  test("should not fetch and map corporate trustees when feature disabled", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(true);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValueOnce(FETCH_CORPORATE_TRUSTEE_DATA_MOCK);
    mockGetTrustLinks.mockResolvedValue([]);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(0);
    expect(appData.update?.review_trusts).toHaveLength(2);
    expect(appData.beneficial_owners_corporate).toEqual(undefined);
  });

  test("should not fetch and map trust links for indivdual BOs when feature disabled", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(true);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue(TRUST_LINKS_DATA_MOCK);

    appData.beneficial_owners_individual = BO_TRUST_LINKS_DATA_MOCK;
    appData.beneficial_owners_individual.forEach(bo => bo.trust_ids = []);
    appData.beneficial_owners_corporate = undefined;

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(0);
    expect(appData.update?.review_trusts).toHaveLength(2);

    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_individual[1].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_individual[2].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_corporate).toEqual(undefined);
  });

  test("should not fetch and map trust links for corporate BOs when feature disabled", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(true);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue(TRUST_LINKS_DATA_MOCK);

    appData.beneficial_owners_individual = undefined;
    appData.beneficial_owners_corporate = BO_TRUST_LINKS_DATA_MOCK;
    appData.beneficial_owners_corporate.forEach(bo => bo.trust_ids = []);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(0);
    expect(appData.update?.review_trusts).toHaveLength(2);

    expect(appData.beneficial_owners_corporate[0].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_corporate[1].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_corporate[2].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_individual).toEqual(undefined);
  });

  test("should fetch and not map trust links in without matching beneficial owners", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([
      {
        hashedTrustId: FETCH_TRUST_DATA_MOCK[0].hashedTrustId,
        hashedCorporateBodyAppointmentId: "bolink100"
      }
    ]);

    appData.beneficial_owners_individual = [
      {
        id: "bo4",
        ch_reference: "bolink400"
      }
    ];

    appData.beneficial_owners_corporate = [
      {
        id: "bo5",
        ch_reference: "bolink500"
      }
    ];

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(2);
    expect(appData.update?.review_trusts).toHaveLength(2);

    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(undefined);
  });

  test("should fetch and not map trust links in without matching trusts", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetIndividualTrustees.mockResolvedValue([]);
    mockGetCorporateTrustees.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValue([
      {
        hashedTrustId: "fhjkds438",
        hashedCorporateBodyAppointmentId: "bolink100"
      }
    ]);

    appData.beneficial_owners_individual = [
      {
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: []
      }
    ];

    appData.beneficial_owners_corporate = [
      {
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: []
      }
    ];

    appData.beneficial_owners_individual.forEach(bo => bo.trust_ids = []);

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(4);
    expect(appData.update?.review_trusts).toHaveLength(2);

    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual([]);
    expect(appData.beneficial_owners_corporate[0].trust_ids).toEqual([]);
  });

  test("should fetch and not map trust links in without any tusts", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue([]);
    mockGetTrustLinks.mockResolvedValueOnce([
      {
        hashedTrustId: "fhjkds438",
        hashedCorporateBodyAppointmentId: "bolink100"
      }
    ]);

    appData.beneficial_owners_individual = [
      {
        id: "bo1",
        ch_reference: "bolink100"
      }
    ];

    appData.beneficial_owners_corporate = [
      {
        id: "bo1",
        ch_reference: "bolink100"
      }
    ];

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(1);
    expect(appData.update?.review_trusts).toHaveLength(0);

    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(undefined);
    expect(appData.beneficial_owners_corporate[0].trust_ids).toEqual(undefined);
  });

  test("should fetch and not map trust links in without any beneficial owners", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetTrustLinks.mockResolvedValueOnce([
      {
        hashedTrustId: "fhjkds438",
        hashedCorporateBodyAppointmentId: "bolink100"
      }
    ]);

    appData.beneficial_owners_individual = undefined;
    appData.beneficial_owners_corporate = undefined;

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(4);
    expect(appData.update?.review_trusts).toHaveLength(2);
    expect(appData.beneficial_owners_individual).toEqual(undefined);
    expect(appData.beneficial_owners_corporate).toEqual(undefined);
  });

  test("should fetch and not map trust links in with empty benefitial owners", async () => {
    const appData: ApplicationData = { ...FETCH_TRUST_APPLICATION_DATA_MOCK, update: { trust_data_fetched: false } };
    mockIsActiveFeature.mockReturnValue(false);
    mockGetTrustData.mockResolvedValue(FETCH_TRUST_DATA_MOCK);
    mockGetTrustLinks.mockResolvedValueOnce([
      {
        hashedTrustId: "fhjkds438",
        hashedCorporateBodyAppointmentId: "bolink100"
      }
    ]);

    appData.beneficial_owners_individual = [];
    appData.beneficial_owners_corporate = [];

    await retrieveTrustData(req, appData);

    expect(mockGetTrustData).toBeCalledTimes(1);
    expect(mockLoggerInfo).toBeCalledTimes(4);
    expect(appData.update?.review_trusts).toHaveLength(2);
    expect(appData.beneficial_owners_individual).toEqual([]);
    expect(appData.beneficial_owners_corporate).toEqual([]);
  });

  test("should fetch and not map trust links when not in update", () => {
    const appData = {
      beneficial_owners_individual: [{
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: undefined
      }] };
    mapTrustLink({
      hashedTrustId: "fhjkds438",
      hashedCorporateBodyAppointmentId: "bolink100",
    }, appData);
    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(undefined);
  });

  test("should fetch and not map trust links when no trusts to review in update", () => {
    const appData = {
      beneficial_owners_individual: [{
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: undefined
      }],
      update: {}
    };
    mapTrustLink({
      hashedTrustId: "fhjkds438",
      hashedCorporateBodyAppointmentId: "bolink100",
    }, appData);
    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(undefined);
  });

  test("should fetch and not map trust links when trusts to review list is empty in update", () => {
    const appData = {
      beneficial_owners_individual: [{
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: undefined
      }],
      update: {
        review_trusts: []
      }
    };
    mapTrustLink({
      hashedTrustId: "fhjkds438",
      hashedCorporateBodyAppointmentId: "bolink100",
    }, appData);
    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(undefined);
  });

  test("should fetch and not map trust links when trusts to review in update does not match", () => {
    const appData = {
      beneficial_owners_individual: [{
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: undefined
      }],
      update: {
        review_trusts:
          [
            {
              trust_id: "1",
              ch_reference: "bolink000",
              trust_name: "Test Trust",
              creation_date_day: "1",
              creation_date_month: "1",
              creation_date_year: "2020",
              unable_to_obtain_all_trust_info: "No"
            }
          ]
      }
    };
    mapTrustLink({
      hashedTrustId: "fhjkds438",
      hashedCorporateBodyAppointmentId: "bolink100",
    }, appData);
    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(undefined);
  });

  test("should fetch and map trust links when trusts to review in update match", () => {
    const appData = {
      beneficial_owners_individual: [{
        id: "bo1",
        ch_reference: "bolink100",
        trust_ids: undefined
      }],
      update: {
        review_trusts:
        [
          {
            trust_id: "1",
            ch_reference: "abcd1234",
            trust_name: "Test Trust",
            creation_date_day: "1",
            creation_date_month: "1",
            creation_date_year: "2020",
            unable_to_obtain_all_trust_info: "No"
          }
        ]
      }
    };
    mapTrustLink({
      hashedTrustId: "abcd1234",
      hashedCorporateBodyAppointmentId: "bolink100",
    }, appData);
    expect(appData.beneficial_owners_individual[0].trust_ids).toEqual(["1"]);
  });

  test("should not any add trustees to trust if no lists of trustees in trust", () => {
    const trust: Trust = {
      trust_id: "1",
      ch_reference: "12345678",
      trust_name: "Test Trust",
      creation_date_day: "1",
      creation_date_month: "1",
      creation_date_year: "2020",
      unable_to_obtain_all_trust_info: "No"
    };
    const trusteeData: IndividualTrusteeData = {
      hashedTrusteeId: "1",
      trusteeForename1: "",
      trusteeSurname: "",
      corporateIndicator: "",
      trusteeTypeId: "",
      appointmentDate: "2021-01-01"
    };
    mapIndividualTrusteeData(trusteeData, trust);
    const historicalTrusteeData: IndividualTrusteeData = {
      hashedTrusteeId: "2",
      trusteeForename1: "",
      trusteeSurname: "",
      corporateIndicator: "",
      trusteeTypeId: "",
      appointmentDate: "2021-01-01",
      ceasedDate: "2023-03-03"
    };
    mapIndividualTrusteeData(historicalTrusteeData, trust);
    const corporateTrusteeData: CorporateTrusteeData = {
      hashedTrusteeId: "3",
      trusteeName: "",
      corporateIndicator: "",
      trusteeTypeId: "",
      appointmentDate: "2021-01-01"
    };
    mapCorporateTrusteeData(corporateTrusteeData, trust);
    const historicalCorporateTrusteeData: CorporateTrusteeData = {
      hashedTrusteeId: "3",
      trusteeName: "",
      corporateIndicator: "",
      trusteeTypeId: "",
      appointmentDate: "2021-01-01",
      ceasedDate: "2022-02-02"
    };
    mapCorporateTrusteeData(historicalCorporateTrusteeData, trust);

    expect(trust.INDIVIDUALS).toEqual(undefined);
    expect(trust.CORPORATES).toEqual(undefined);
    expect(trust.HISTORICAL_BO).toEqual(undefined);
  });

  test("should map trustees into trust when trustees are missing dates", () => {
    const trust: Trust = {
      trust_id: "1",
      ch_reference: "12345678",
      trust_name: "Test Trust",
      unable_to_obtain_all_trust_info: "No",
      creation_date_day: "1",
      creation_date_month: "1",
      creation_date_year: "2020",
      INDIVIDUALS: [],
      CORPORATES: [],
      HISTORICAL_BO: []
    };
    const trusteeData = {
      hashedTrusteeId: "1",
      trusteeForename1: "",
      trusteeSurname: "",
      corporateIndicator: "",
      trusteeTypeId: ""
    } as unknown as IndividualTrusteeData;
    mapIndividualTrusteeData(trusteeData, trust);
    const historicalTrusteeData = {
      hashedTrusteeId: "2",
      trusteeForename1: "",
      trusteeSurname: "",
      corporateIndicator: "",
      trusteeTypeId: "",
      ceasedDate: "2023-03-03"
    } as unknown as IndividualTrusteeData;
    mapIndividualTrusteeData(historicalTrusteeData, trust);
    const corporateTrusteeData = {
      hashedTrusteeId: "3",
      trusteeName: "",
      corporateIndicator: "",
      trusteeTypeId: ""
    } as unknown as CorporateTrusteeData;
    mapCorporateTrusteeData(corporateTrusteeData, trust);
    const historicalCorporateTrusteeData: CorporateTrusteeData = {
      hashedTrusteeId: "3",
      trusteeName: "",
      corporateIndicator: "",
      trusteeTypeId: "",
      ceasedDate: "2022-02-02"
    } as unknown as CorporateTrusteeData;
    mapCorporateTrusteeData(historicalCorporateTrusteeData, trust);

    expect(trust.INDIVIDUALS).toHaveLength(1);
    expect(trust.CORPORATES).toHaveLength(1);
    expect(trust.HISTORICAL_BO).toHaveLength(2);
  });
});
