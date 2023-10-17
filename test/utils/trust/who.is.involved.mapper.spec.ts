jest.mock('../../../src/utils/trusts');
jest.mock('../../../src/utils/trust/beneficial.owner.mapper');
jest.mock('../../../src/utils/trust/legal.entity.beneficial.owner.mapper');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mapTrustWhoIsInvolvedToPage } from "../../../src/utils/trust/who.is.involved.mapper";
import { getTrustBoIndividuals, getTrustBoOthers, getTrustByIdFromApp, getLegalEntityBosInTrust } from '../../../src/utils/trusts';
import { mapBoIndividualToPage, mapBoOtherToPage } from "../../../src/utils/trust/beneficial.owner.mapper";
import { mapLegalEntityItemToPage } from "../../../src/utils/trust/legal.entity.beneficial.owner.mapper";
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
    jest.resetAllMocks();
  });

  describe('mapTrustWhoIsInvolvedToPage method tests', () => {
    test('mapTrustWhoIsInvolvedToPage should return object with mapped data', () => {
      const mockBoIndividuals = [{}, {}];
      (getTrustBoIndividuals as jest.Mock).mockReturnValue(mockBoIndividuals);
      const mockBoOthers = [{}];
      (getTrustBoOthers as jest.Mock).mockReturnValue(mockBoOthers);
      const mocklegalEntities = [{}];
      (getLegalEntityBosInTrust as jest.Mock).mockReturnValue(mocklegalEntities);

      const expectBoIndividualResult = 'dummyBoIndividualMappingResult';
      (mapBoIndividualToPage as jest.Mock).mockReturnValue(expectBoIndividualResult);

      const expectBoOtherResult = 'dummyBoOtherMappingResult';
      (mapBoOtherToPage as jest.Mock).mockReturnValue(expectBoOtherResult);

      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust1);
      const expectlegalEntityResult = 'dummylegalEntityResult';
      (mapLegalEntityItemToPage as jest.Mock).mockReturnValue(expectlegalEntityResult);

      const actual = mapTrustWhoIsInvolvedToPage(mockAppData, mockTrust1.trust_id, false);

      expect(actual).toEqual({
        boInTrust: [
          expectBoIndividualResult,
          expectBoIndividualResult,
          expectBoOtherResult,
        ],
        trustees: [
          expectlegalEntityResult,
        ]
      });

      expect(getTrustBoIndividuals).toBeCalledWith(mockAppData, mockTrust1.trust_id);
      expect(getTrustBoOthers).toBeCalledWith(mockAppData, mockTrust1.trust_id);
      expect(getLegalEntityBosInTrust).toBeCalledWith(mockAppData, mockTrust1.trust_id);
    });
  });
});
