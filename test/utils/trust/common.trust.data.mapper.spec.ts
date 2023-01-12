import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as Trust from '../../../src/model/trust.model';
import { mapCommonTrustDataToPage  } from "../../../src/utils/trust/common.trust.data.mapper";

describe('Common Trust Data Mapper to Page Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapCommonTrustDataToPage method tests', () => {
    test('data is not provided, should return empty object', () => {
      expect(mapCommonTrustDataToPage(undefined)).toEqual({});
    });

    test('mapCommonTrustDataToPage should return object with mapped data', () => {
      const objInSession = {
        trust_id: '999',
        trust_name: 'dummyName',
      } as Trust.Trust;

      expect(mapCommonTrustDataToPage(objInSession)).toEqual({
        id: objInSession.trust_id,
        trustName: objInSession.trust_name,
      });
    });
  });
});
