import { describe, expect, test } from '@jest/globals';

import { getApplicationData } from "../../src/utils/application.data";
import { APPLICATION_DATA_UPDATE_BO_MOCK, getSessionRequestWithExtraData } from "../__mocks__/session.mock";
import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKeys
} from "../../src/model/beneficial.owner.individual.model";
import { ApplicationData } from '../../src/model';
import { HasSameResidentialAddressKey, IsOnSanctionsListKey } from '../../src/model/data.types.model';

describe("BO Individual model", () => {
  let session;
  let appData;
  let boiData = {};
  let boiDataKeys: string[];

  beforeAll(async () => {
    session = getSessionRequestWithExtraData(APPLICATION_DATA_UPDATE_BO_MOCK);
    appData = await getApplicationData(session) as ApplicationData;

    if (appData.beneficial_owners_individual) {
      boiData = appData.beneficial_owners_individual[0] as BeneficialOwnerIndividual;
    }
    boiDataKeys = Object.keys(boiData);
  });

  test("BOI keys to be equal to BeneficialOwnerIndividualKeys object", () => {
    expect(boiDataKeys).toEqual(BeneficialOwnerIndividualKeys);
  });
  test("HasSameAddressKey is a BOI key", () => {
    expect(boiDataKeys.includes(HasSameResidentialAddressKey)).toBeTruthy();
  });
  test("IsOnSanctionsListKey is a BOI key", () => {
    expect(boiDataKeys.includes(IsOnSanctionsListKey)).toBeTruthy();
  });
});
