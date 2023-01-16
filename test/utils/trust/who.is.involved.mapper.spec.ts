jest.mock('../../../src/utils/trusts');
jest.mock('../../../src/utils/trust/beneficial.owner.mapper');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mapTrustWhoIsInvolvedToPage } from "../../../src/utils/trust/who.is.involved.mapper";
import { getTrustBoIndividuals, getTrustBoOthers } from '../../../src/utils/trusts';
import { mapBoIndividualToPage, mapBoOtherToPage } from "../../../src/utils/trust/beneficial.owner.mapper";
import { TrustKey } from '../../../src/model/trust.model';

describe('Trust Involved Mapper to Page Service', () => {
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

  describe('mapTrustWhoIsInvolvedToPage method tests', () => {
    test('mapTrustWhoIsInvolvedToPage should return object with mapped data', () => {
      const mockBoIndividuals = [{}, {}];
      (getTrustBoIndividuals as jest.Mock).mockReturnValue(mockBoIndividuals);
      const mockBoOthers = [{}];
      (getTrustBoOthers as jest.Mock).mockReturnValue(mockBoOthers);

      const expectBoIndividualResult = 'dummyBoIndividualMappingResult';
      (mapBoIndividualToPage as jest.Mock).mockReturnValue(expectBoIndividualResult);

      const expectBoOtherResult = 'dummyBoOtherMappingResult';
      (mapBoOtherToPage as jest.Mock).mockReturnValue(expectBoOtherResult);

      const actual = mapTrustWhoIsInvolvedToPage(mockAppData, mockTrust1.trust_id);

      expect(actual).toEqual({
        trustId: mockTrust1.trust_id,
        trustName: mockTrust1.trust_name,
        boInTrust: [
          expectBoIndividualResult,
          expectBoIndividualResult,
          expectBoOtherResult,
        ],
      });

      expect(getTrustBoIndividuals).toBeCalledWith(mockAppData, mockTrust1.trust_id);
      expect(getTrustBoOthers).toBeCalledWith(mockAppData, mockTrust1.trust_id);
    });
  });
});
