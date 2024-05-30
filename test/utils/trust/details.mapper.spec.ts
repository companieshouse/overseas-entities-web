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
    trust_still_involved_in_overseas_entity: 'No',
    unable_to_obtain_all_trust_info: 'Yes',
  };
  const mockTrust2 = {
    trust_id: '2000',
    trust_name: 'dummyName2',
    creation_date_day: '10',
    creation_date_month: '11',
    creation_date_year: '2077',
    trust_still_involved_in_overseas_entity: 'Yes',
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
    test('mapDetailToPage should return object (verify mapping of hasAllInfo and stillInvolved when false)', () => {
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
        stillInvolved: '0',
        hasAllInfo: '0',
      });
    });
    test('mapDetailToPage should return object (verify mapping of hasAllInfo and stillInvolved when true)', () => {
      expect(mapDetailToPage(mockAppData, mockTrust2.trust_id, false)).toEqual({
        trustId: mockTrust2.trust_id,
        name: mockTrust2.trust_name,
        createdDateDay: mockTrust2.creation_date_day,
        createdDateMonth: mockTrust2.creation_date_month,
        createdDateYear: mockTrust2.creation_date_year,
        beneficialOwnersIds: [
          mockBoIndividual1.id,
        ],
        stillInvolved: '1',
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
      stillInvolved: '0',
      hasAllInfo: '1',
    } as Page.TrustDetailsForm;

    const mockFormData2 = {
      trustId: '999',
      name: 'dummyName',
      createdDateDay: '99',
      createdDateMonth: '88',
      createdDateYear: '2077',
      stillInvolved: '1',
      hasAllInfo: '0',
    } as Page.TrustDetailsForm;

    const mockFormData3 = {
      trustId: '999',
      name: 'dummyName',
      createdDateDay: '99',
      createdDateMonth: '88',
      createdDateYear: '2077',
      ceasedDateDay: '15',
      ceasedDateMonth: '04',
      ceasedDateYear: '2022',
      stillInvolved: '1',
      hasAllInfo: '0',
    } as Page.TrustDetailsForm;

    test('mapDetailToSession should return object (verify mapping of unable_to_obtain_all_trust_info and trust_still_involved_in_overseas_entity when false)', () => {
      expect(mapDetailToSession(mockFormData, false, false)).toEqual({
        trust_id: mockFormData.trustId,
        trust_name: mockFormData.name,
        creation_date_day: mockFormData.createdDateDay,
        creation_date_month: mockFormData.createdDateMonth,
        creation_date_year: mockFormData.createdDateYear,
        ceased_date_day: undefined,
        ceased_date_month: undefined,
        ceased_date_year: undefined,
        trust_still_involved_in_overseas_entity: "No",
        unable_to_obtain_all_trust_info: "No",
      });
    });

    test('mapDetailToSession should return object (verify mapping of unable_to_obtain_all_trust_info and trust_still_involved_in_overseas_entity when true)', () => {
      expect(mapDetailToSession(mockFormData2, false, true)).toEqual({
        trust_id: mockFormData2.trustId,
        trust_name: mockFormData2.name,
        creation_date_day: mockFormData2.createdDateDay,
        creation_date_month: mockFormData2.createdDateMonth,
        creation_date_year: mockFormData2.createdDateYear,
        ceased_date_day: undefined,
        ceased_date_month: undefined,
        ceased_date_year: undefined,
        trust_still_involved_in_overseas_entity: "Yes",
        unable_to_obtain_all_trust_info: "Yes",
      });
    });

    test('mapDetailToSession should return object including ceased date', () => {
      expect(mapDetailToSession(mockFormData3, true, true)).toEqual({
        trust_id: mockFormData3.trustId,
        trust_name: mockFormData3.name,
        creation_date_day: mockFormData3.createdDateDay,
        creation_date_month: mockFormData3.createdDateMonth,
        creation_date_year: mockFormData3.createdDateYear,
        ceased_date_day: mockFormData3.ceasedDateDay,
        ceased_date_month: mockFormData3.ceasedDateMonth,
        ceased_date_year: mockFormData3.ceasedDateYear,
        trust_still_involved_in_overseas_entity: "Yes",
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
