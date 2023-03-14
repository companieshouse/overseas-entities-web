jest.mock('uuid');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as uuid from 'uuid';
import * as Page from '../../../src/model/trust.page.model';
import {
  generateBoId,
  mapBeneficialOwnerToSession,
} from '../../../src/utils/trust/historical.beneficial.owner.mapper';
import { TrusteeType } from "../../../src/model/trustee.type.model";
import { yesNoResponse } from "../../../src/model/data.types.model";

describe('Historical Beneficial Owner page Mapper Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
          type: TrusteeType.INDIVIDUAL as TrusteeType,
          firstName: 'dummyFirstName',
          lastName: 'dummyLastName',
        };

        expect(mapBeneficialOwnerToSession(mockFormData as Page.TrustHistoricalBeneficialOwnerForm)).toEqual({
          id: mockFormData.boId,
          corporate_indicator: yesNoResponse.No,
          forename: mockFormData.firstName,
          surname: mockFormData.lastName,
          notified_date_day: mockFormData.startDateDay,
          notified_date_month: mockFormData.startDateMonth,
          notified_date_year: mockFormData.startDateYear,
          ceased_date_day: mockFormData.endDateDay,
          ceased_date_month: mockFormData.endDateMonth,
          ceased_date_year: mockFormData.endDateYear,

        });
      });

      test('map corporate', () => {
        const mockFormData = {
          ...mockFormDataBasic,
          type: TrusteeType.LEGAL_ENTITY as TrusteeType,
          corporate_name: 'dummycorporate_name',
        };

        const expectNewId = '9999';
        jest.spyOn(uuid, 'v4').mockReturnValue(expectNewId);

        expect(mapBeneficialOwnerToSession(mockFormData as Page.TrustHistoricalBeneficialOwnerForm)).toEqual({
          id: expectNewId,
          corporate_indicator: yesNoResponse.Yes,
          corporate_name: mockFormData.corporate_name,
          notified_date_day: mockFormData.startDateDay,
          notified_date_month: mockFormData.startDateMonth,
          notified_date_year: mockFormData.startDateYear,
          ceased_date_day: mockFormData.endDateDay,
          ceased_date_month: mockFormData.endDateMonth,
          ceased_date_year: mockFormData.endDateYear,
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
