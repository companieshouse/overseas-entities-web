import { describe, expect, test } from '@jest/globals';
import {
  APPLICATION_DATA_MOCK
} from '../../__mocks__/session.mock';
import { ManagingOfficerKey } from "../../../src/model/managing.officer.model";
import { ManagingOfficerCorporateKey } from "../../../src/model/managing.officer.corporate.model";
import { BeneficialOwnerOtherKey } from "../../../src/model/beneficial.owner.other.model";
import { BeneficialOwnerGovKey } from "../../../src/model/beneficial.owner.gov.model";
import { BeneficialOwnerIndividualKey } from "../../../src/model/beneficial.owner.individual.model";
import { hasFetchedBoAndMoData } from "../../../src/utils/update/beneficial_owners_managing_officers_data_fetch";
import { ApplicationData } from '../../../src/model';

describe("BO/MO fetch Utils", () => {
  let appData: ApplicationData;

  beforeEach(() => {
    appData = APPLICATION_DATA_MOCK;
  });

  test("hasFetchedBoAndMoData returns true if all keys true", () => {
    expect(hasFetchedBoAndMoData(appData)).toEqual(true);
  });

  test("hasFetchedBoAndMoData returns true if only BeneficialOwnerIndividualKey key defined", () => {
    delete appData[ManagingOfficerKey];
    delete appData[ManagingOfficerCorporateKey];
    delete appData[BeneficialOwnerOtherKey];
    delete appData[BeneficialOwnerGovKey];

    expect(hasFetchedBoAndMoData(appData)).toEqual(true);
  });

  test("hasFetchedBoAndMoData returns false if all keys undefined", () => {
    delete appData[BeneficialOwnerIndividualKey];
    delete appData[BeneficialOwnerGovKey];
    delete appData[BeneficialOwnerOtherKey];
    delete appData[ManagingOfficerCorporateKey];
    delete appData[ManagingOfficerKey];

    expect(hasFetchedBoAndMoData(appData)).toEqual(false);
  });
});
