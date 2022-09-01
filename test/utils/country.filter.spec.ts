import { describe, expect, test } from '@jest/globals';

import { countryFilter, UK_COUNTRIES } from '../../src/utils/country.filter';

describe("country filter utils", () => {

  test("return true if the country is not UK", () => {
    const isNonUkCountry = countryFilter({ value: "Tuvalu" });

    expect(isNonUkCountry).toEqual(true);
  });

  UK_COUNTRIES.forEach( country => {
    test("return false if the country is part of the United Kingdom", () => {
      const isNonUKCountry = countryFilter({ value: country });

      expect(isNonUKCountry).toEqual(false);
    });
  });

});
