import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {
  generateTrustId,
  mapBeneficialOwnerToSession,
  mapDetailToPage,
  mapDetailToSession,
} from "../../../src/utils/trust/details.mapper";
import * as Page from '../../../src/model/trust.page.model';
import { TrustKey } from '../../../src/model/trust.model';
import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKey,
} from '../../../src/model/beneficial.owner.individual.model';
import {
  BeneficialOwnerOther,
  BeneficialOwnerOtherKey,
} from '../../../src/model/beneficial.owner.other.model';
-
describe('Trust Details page Mapper Service', () => {
  const mockTrust1 = {
    trust_id: '999',
    trust_name: 'dummyName',
    creation_date_day: '99',
    creation_date_month: '88',
    creation_date_year: '2077',
    unable_to_obtain_all_trust_info: '1',
  };
  const mockBoIndividual1 = {
    id: '9001',
    trust_ids: ['901', mockTrust1.trust_id],
  } as BeneficialOwnerIndividual;

  const mockBoOle1 = {
    id: '8001',
    trust_ids: ['811', mockTrust1.trust_id],
  } as BeneficialOwnerOther;

  const mockAppData = {
    [TrustKey]: [
      mockTrust1,
    ],
    [BeneficialOwnerIndividualKey]: [
      mockBoIndividual1,
      {} as BeneficialOwnerIndividual,
    ],
    [BeneficialOwnerOtherKey]: [
      {} as BeneficialOwnerOther,
      mockBoOle1,
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('To Page mapper methods tests', () => {
    test('mapDetailToPage should return object', () => {
      expect(mapDetailToPage(mockAppData, mockTrust1.trust_id)).toEqual({
        id: mockTrust1.trust_id,
        name: mockTrust1.trust_name,
        createdDateDay: mockTrust1.creation_date_day,
        createdDateMonth: mockTrust1.creation_date_month,
        createdDateYear: mockTrust1.creation_date_year,
        beneficialOwnersIds: [
          mockBoIndividual1.id,
          mockBoOle1.id,
        ],
        hasAllInfo: mockTrust1.unable_to_obtain_all_trust_info,
      });
    });
  });

  describe('To Session mapper methods test', () => {
    const mockFormData = {
      id: '999',
      name: 'dummyName',
      createdDateDay: '99',
      createdDateMonth: '88',
      createdDateYear: '2077',
      hasAllInfo: '1',
    } as Page.TrustDetails;

    test('mapDetailToSession should return object', () => {
      expect(mapDetailToSession(mockFormData)).toEqual({
        trust_id: mockFormData.id,
        trust_name: mockFormData.name,
        creation_date_day: mockFormData.createdDateDay,
        creation_date_month: mockFormData.createdDateMonth,
        creation_date_year: mockFormData.createdDateYear,
        unable_to_obtain_all_trust_info: mockFormData.hasAllInfo,
      });
    });

    test('mapBeneficialOwnerToSession should remove trust from session BO objects', () => {
      const actual = mapBeneficialOwnerToSession(
        mockAppData[BeneficialOwnerIndividualKey],
        [],
        mockTrust1.trust_id,
      );

      expect(actual).toEqual([
        {
          ...mockBoIndividual1,
          trust_ids: ['901'],
        },
        {
          trust_ids: [],
        },
      ]);
    });

    test('mapBeneficialOwnerToSession should add trust to session BO objects', () => {
      const newTrustId = 'newTrustId';

      const actual = mapBeneficialOwnerToSession(
        mockAppData[BeneficialOwnerIndividualKey],
        [mockBoIndividual1.id],
        newTrustId,
      );

      expect(actual).toEqual([
        {
          ...mockBoIndividual1,
          trust_ids: [
            ...mockBoIndividual1.trust_ids!,
            newTrustId,
          ],
        },
        {
          trust_ids: [],
        },
      ]);
    });
  });

  test('mapDetailToSession should return object', () => {
    expect(generateTrustId(mockAppData)).toBe('2');
  });
});
