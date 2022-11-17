import { describe, expect } from '@jest/globals';
import { isActiveFeature } from "../../src/utils/feature.flag";

describe("feature flag tests", function () {
  const dataExpectFalse = [
    'false',
    'faLse',
    '0',
    'off',
    'oFF',
    'kdjhskjf',
  ];

  test.each(dataExpectFalse)('should return false if variable is %p', (val) => {
    const active = isActiveFeature(val as any);
    expect(active).toBeFalsy;
  });

  const dataExpectTrue = [
    'true',
    'trUe',
    'TRUE',
    'on',
    'oN',
    '1',
  ];

  test.each(dataExpectTrue)('should return true if variable is %p', (val) => {
    const active = isActiveFeature(val as any);
    expect(active).toBeTruthy();
  });
});
