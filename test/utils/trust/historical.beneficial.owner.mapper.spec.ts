jest.mock('uuid');

import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ApplicationData } from "../../../src/model";
import * as uuid from 'uuid';
import * as Page from '../../../src/model/trust.page.model';
import {
  generateBoId,
  mapBeneficialOwnerToSession,
  mapFormerTrusteeByIdFromSessionToPage,
} from '../../../src/utils/trust/historical.beneficial.owner.mapper';
import { TrusteeType } from "../../../src/model/trustee.type.model";
import { yesNoResponse } from "../../../src/model/data.types.model";
import { TrustHistoricalBeneficialOwner, TrustKey } from "../../../src/model/trust.model";

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

  describe('From session to page mapper method tests', () => {
    describe('Map historical/former trustee from session to page Beneficial owner mapper', () => {

      const trustId = '987';
      const trusteeId = '9998';

      const mockSessionDataBasic = {
        id: trusteeId,
        notified_date_day: "01",
        notified_date_month: "12",
        notified_date_year: "1970",
        ceased_date_day: "10",
        ceased_date_month: "04",
        ceased_date_year: "2001",
      };

      test('map individual', () => {
        const mockSessionData = {
          ...mockSessionDataBasic,
          corporate_indicator: yesNoResponse.Yes,
          forename: 'dummyFirstName',
          surname: 'dummyLastName',
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'HISTORICAL_BO': [ mockSessionData ] as TrustHistoricalBeneficialOwner[],
          }]
        } as ApplicationData;

        expect(mapFormerTrusteeByIdFromSessionToPage(appData, trustId, trusteeId )).toEqual({
          boId: mockSessionData.id,
          type: TrusteeType.INDIVIDUAL,
          firstName: mockSessionData.forename,
          lastName: mockSessionData.surname,
          startDateDay: mockSessionData.notified_date_day,
          startDateMonth: mockSessionData.notified_date_month,
          startDateYear: mockSessionData.notified_date_year,
          endDateDay: mockSessionData.ceased_date_day,
          endDateMonth: mockSessionData.ceased_date_month,
          endDateYear: mockSessionData.ceased_date_year,
          is_newly_added: true,

        });
      });

      test('map corporate', () => {
        const mockSessionData = {
          ...mockSessionDataBasic,
          corporate_indicator: yesNoResponse.Yes,
          corporate_name: 'dummycorporate_name',
        };

        const appData = {
          [TrustKey]: [{
            'trust_id': trustId,
            'HISTORICAL_BO': [ mockSessionData ] as TrustHistoricalBeneficialOwner[],
          }]
        } as ApplicationData;

        expect(mapFormerTrusteeByIdFromSessionToPage( appData, trustId, trusteeId )).toEqual({

          boId: mockSessionData.id,
          type: TrusteeType.LEGAL_ENTITY,
          corporate_name: mockSessionData.corporate_name,
          startDateDay: mockSessionData.notified_date_day,
          startDateMonth: mockSessionData.notified_date_month,
          startDateYear: mockSessionData.notified_date_year,
          endDateDay: mockSessionData.ceased_date_day,
          endDateMonth: mockSessionData.ceased_date_month,
          endDateYear: mockSessionData.ceased_date_year,
          is_newly_added: true,
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
