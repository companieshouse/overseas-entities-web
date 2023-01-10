import { describe, expect, test } from '@jest/globals';
import { isValidUrl } from '../../src/utils/validate.url';
import { REGISTER_AN_OVERSEAS_ENTITY_URL } from '../../src/config';

describe("Validate URL Tests", () => {

  test("Should return true on valid URL ", () => {
    const validUrl = isValidUrl(REGISTER_AN_OVERSEAS_ENTITY_URL);
    expect(validUrl).toEqual(true);

  });

  test("Should throw error on bad URL", () => {
    expect(() => isValidUrl("rouge-address")).toThrowError();

  });
});
