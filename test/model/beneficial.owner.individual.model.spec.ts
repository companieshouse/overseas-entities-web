import { describe, expect, test } from '@jest/globals';

import { getApplicationData } from "../../src/utils/application.data";
import { getSessionRequestWithExtraData } from "../__mocks__/session.mock";
import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKeys,
  HasSameAddressKey,
  IsOnSanctionsListKey,
} from "../../src/model/beneficial.owner.individual.model";
import { ApplicationData } from '../../src/model';

describe("BO Individua model", () => {
  const session = getSessionRequestWithExtraData();
  const appData = getApplicationData(session) as ApplicationData;
  const boiData = appData.beneficial_owners_individual[0] as BeneficialOwnerIndividual;
  const boiDataKeys = Object.keys(boiData);

  test("BOI keys to be equal to BeneficialOwnerIndividualKeys object", () => {
    expect(boiDataKeys).toEqual(BeneficialOwnerIndividualKeys);
  });
  test("HasSameAddressKey is a BOI key", () => {
    expect(boiDataKeys.includes(HasSameAddressKey)).toBeTruthy();
  });
  test("IsOnSanctionsListKey is a BOI key", () => {
    expect(boiDataKeys.includes(IsOnSanctionsListKey)).toBeTruthy();
  });
});
