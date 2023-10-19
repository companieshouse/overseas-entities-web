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

describe('Trust Details page Mapper Service', () => {
  const mockTrust1 = {
    trust_id: '999',
    trust_name: 'dummyName',
    creation_date_day: '99',
    creation_date_month: '88',
    creation_date_year: '2077',
    unable_to_obtain_all_trust_info: 'Yes',
  };
  const mockTrust2 = {
    trust_id: '2000',
    trust_name: 'dummyName2',
    creation_date_day: '10',
    creation_date_month: '11',
    creation_date_year: '2077',
    unable_to_obtain_all_trust_info: 'No',
  };
  const mockBoIndividual1 = {
    id: '9001',
    trust_ids: ['901', mockTrust1.trust_id, mockTrust2.trust_id],
  } as BeneficialOwnerIndividual;

  const mockBoOle1 = {
    id: '8001',
    trust_ids: ['811', mockTrust1.trust_id],
  } as BeneficialOwnerOther;

  const mockAppData = {
    [TrustKey]: [
      mockTrust1,
      mockTrust2,
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

  const unknownTrustId = '3838373838';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('To Page mapper methods tests', () => {
    test('mapDetailToPage should return object (verify mapping of hasAllInfo when false)', () => {
      expect(mapDetailToPage(mockAppData, mockTrust1.trust_id, false)).toEqual({
        trustId: mockTrust1.trust_id,
        name: mockTrust1.trust_name,
        createdDateDay: mockTrust1.creation_date_day,
        createdDateMonth: mockTrust1.creation_date_month,
        createdDateYear: mockTrust1.creation_date_year,
        beneficialOwnersIds: [
          mockBoIndividual1.id,
          mockBoOle1.id,
        ],
        hasAllInfo: '0',
      });
    });
    test('mapDetailToPage should return object (verify mapping of hasAllInfo when true)', () => {
      expect(mapDetailToPage(mockAppData, mockTrust2.trust_id, false)).toEqual({
        trustId: mockTrust2.trust_id,
        name: mockTrust2.trust_name,
        createdDateDay: mockTrust2.creation_date_day,
        createdDateMonth: mockTrust2.creation_date_month,
        createdDateYear: mockTrust2.creation_date_year,
        beneficialOwnersIds: [
          mockBoIndividual1.id,
        ],
        hasAllInfo: '1',
      });
    });
    test('mapDetailToPage should return object (verify mapping of hasAllInfo for new trust)', () => {
      const initialFormDetails = mapDetailToPage(mockAppData, unknownTrustId, false);
      expect(initialFormDetails.hasAllInfo).toBe("");
    });
  });

  describe('To Session mapper methods test', () => {
    const mockFormData = {
      trustId: '999',
      name: 'dummyName',
      createdDateDay: '99',
      createdDateMonth: '88',
      createdDateYear: '2077',
      hasAllInfo: '1',
    } as Page.TrustDetailsForm;

    const mockFormData2 = {
      trustId: '999',
      name: 'dummyName',
      createdDateDay: '99',
      createdDateMonth: '88',
      createdDateYear: '2077',
      hasAllInfo: '0',
    } as Page.TrustDetailsForm;

    test('mapDetailToSession should return object (verify mapping of unable_to_obtain_all_trust_info when false)', () => {
      expect(mapDetailToSession(mockFormData)).toEqual({
        trust_id: mockFormData.trustId,
        trust_name: mockFormData.name,
        creation_date_day: mockFormData.createdDateDay,
        creation_date_month: mockFormData.createdDateMonth,
        creation_date_year: mockFormData.createdDateYear,
        unable_to_obtain_all_trust_info: "No",
      });
    });

    test('mapDetailToSession should return object (verify mapping of unable_to_obtain_all_trust_info when true)', () => {
      expect(mapDetailToSession(mockFormData2)).toEqual({
        trust_id: mockFormData.trustId,
        trust_name: mockFormData.name,
        creation_date_day: mockFormData.createdDateDay,
        creation_date_month: mockFormData.createdDateMonth,
        creation_date_year: mockFormData.createdDateYear,
        unable_to_obtain_all_trust_info: "Yes",
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
          trust_ids: ['901', mockTrust2.trust_id],
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
            ...mockBoIndividual1.trust_ids || [],
            newTrustId,
          ],
        },
        {
          trust_ids: [],
        },
      ]);
    });
  });

  test('mapDetailToSession should return next trust id', () => {
    expect(generateTrustId(mockAppData)).toBe('3');
  });
});
