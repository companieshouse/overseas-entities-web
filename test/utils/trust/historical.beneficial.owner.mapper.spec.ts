jest.mock('uuid');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as uuid from 'uuid';
import * as Page from '../../../src/model/trust.page.model';
import { TrustHistoricalBeneficialOwnerType, TrustKey } from '../../../src/model/trust.model';
import {
  generateBoId,
  mapBeneficialOwnerToSession,
  mapTrustToPage,
} from '../../../src/utils/trust/historical.beneficial.owner.mapper';

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
      expect(mapTrustToPage(mockAppData, mockTrust1.trust_id)).toEqual({
        trustId: mockTrust1.trust_id,
        trustName: mockTrust1.trust_name,
      });
    });
  });

  describe('To Session mapper methods test', () => {
    describe('History Beneficial owner mapper', () => {
      const mockFormDataBasic = {
        startDateDay: '99',
        startDateMonth: '98',
        startDateYear: '2097',
        endDateDay: '89',
        endDateMonth: '88',
        endDateYear: '2087',
      };

      test('map individual', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          boId: '9999',
          type: '0' as TrustHistoricalBeneficialOwnerType,
          firstName: 'dummyFirstName',
          lastName: 'dummyLastName',
        };

        expect(mapBeneficialOwnerToSession(mockFormData as Page.TrustHistoricalBeneficialOwnerForm)).toEqual({
          id: mockFormData.boId,
          corporateIndicator: mockFormData.type,
          forename: mockFormData.firstName,
          surname: mockFormData.lastName,
          ceased_date_day: mockFormData.startDateDay,
          ceased_date_month: mockFormData.startDateMonth,
          ceased_date_year: mockFormData.startDateYear,
          notified_date_day: mockFormData.endDateDay,
          notified_date_month: mockFormData.endDateMonth,
          notified_date_year: mockFormData.endDateYear,
        });
      });

      test('map corporate', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          type: '1' as TrustHistoricalBeneficialOwnerType,
          corporateName: 'dummyCorporateName',
        };

        const expectNewId = '9999';
        jest.spyOn(uuid, 'v4').mockReturnValue(expectNewId);

        expect(mapBeneficialOwnerToSession(mockFormData as Page.TrustHistoricalBeneficialOwnerForm)).toEqual({
          id: expectNewId,
          corporateIndicator: mockFormData.type,
          corporateName: mockFormData.corporateName,
          ceased_date_day: mockFormData.startDateDay,
          ceased_date_month: mockFormData.startDateMonth,
          ceased_date_year: mockFormData.startDateYear,
          notified_date_day: mockFormData.endDateDay,
          notified_date_month: mockFormData.endDateMonth,
          notified_date_year: mockFormData.endDateYear,
        });
      });
    });
  });

  test('test generateBoId', () => {
    const expectNewId = '9999';
    jest.spyOn(uuid, 'v4').mockReturnValue(expectNewId);

    expect(generateBoId()).toBe(expectNewId);
  });
});
