import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mapCommonTrustDataToPage } from "../../../src/utils/trust/common.trust.data.mapper";
import { TrustKey } from '../../../src/model/trust.model';

describe('Common Trust Data Mapper to Page Service', () => {

  const mockTrust1 = {
    trust_id: '999',
    trust_name: 'dummyName',
    creation_date_day: '99',
    creation_date_month: '88',
    creation_date_year: '2077',
    unable_to_obtain_all_trust_info: '1',
  };

  const mockAppData = {
    [TrustKey]: [
      mockTrust1,
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapCommonTrustDataToPage method tests', () => {
    test('data is not provided, should return empty object', () => {
      expect(mapCommonTrustDataToPage({}, "", false)).toEqual({});
    });

    test('mapCommonTrustDataToPage should return object with mapped data', () => {
      expect(mapCommonTrustDataToPage(mockAppData, mockTrust1.trust_id, false)).toEqual({
        trustId: mockTrust1.trust_id,
        trustName: mockTrust1.trust_name,
      });
    });
  });
});
