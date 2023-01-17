import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mapDetailToPage } from "../../../src/utils/trust/details.mapper";
import { TrustKey } from '../../../src/model/trust.model';

describe('Historical Beneficial Owner page Mapper Service', () => {
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

  describe('To Page mapper methods tests', () => {
    test('mapTrustToPage should return object', () => {
      expect(mapDetailToPage(mockAppData, mockTrust1.trust_id)).toEqual({
        id: mockTrust1.trust_id,
        name: mockTrust1.trust_name,
        createdDateDay: mockTrust1.creation_date_day,
        createdDateMonth: mockTrust1.creation_date_month,
        createdDateYear: mockTrust1.creation_date_year,
        hasAllInfo: mockTrust1.unable_to_obtain_all_trust_info,
        beneficialOwnersIds: [],
      });
    });
  });
});
