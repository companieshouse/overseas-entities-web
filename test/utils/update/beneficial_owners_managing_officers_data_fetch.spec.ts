import { describe, expect, test } from '@jest/globals';
import { hasFetchedBoAndMoData, setFetchedBoMoData } from "../../../src/utils/update/beneficial_owners_managing_officers_data_fetch";
import { ApplicationData } from '../../../src/model';

describe("BO/MO fetch Utils", () => {
  let appData: ApplicationData;

  beforeEach(() => {
    appData = {};
  });

  test("hasFetchedBoAndMoData returns true on empty AppData", () => {
    expect(hasFetchedBoAndMoData(appData)).toEqual(false);
  });

  test("hasFetchedBoAndMoData returns false after setFetchedBoAndMoData", () => {
    setFetchedBoMoData(appData);
    expect(hasFetchedBoAndMoData(appData)).toEqual(true);
  });
});
