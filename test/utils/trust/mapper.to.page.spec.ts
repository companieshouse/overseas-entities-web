import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as Trust from '../../../src/model/trust.model';
import { mapBeneficialOwnerToPage, mapDetailToPage } from "../../../src/utils/trust/mapper.to.page";

describe('Trust Mapper to Page Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapDetail method tests', () => {
    test('data not provided, should return empty object', () => {
      expect(mapDetailToPage(undefined)).toEqual({});
    });

    test('mapDetail should return object', () => {
      const objInSession = {
        trust_id: '999',
        trust_name: 'dummyName',
        creation_date_day: '99',
        creation_date_month: '88',
        creation_date_year: '2077',
        unable_to_obtain_all_trust_info: '1',
        HISTORICAL_BO: [],
      } as Trust.Trust;

      expect(mapDetailToPage(objInSession)).toEqual({
        id: objInSession.trust_id,
        name: objInSession.trust_name,
        createdDateDay: objInSession.creation_date_day,
        createdDateMonth: objInSession.creation_date_month,
        createdDateYear: objInSession.creation_date_year,
        beneficialOwners: [],
        hasAllInfo: objInSession.unable_to_obtain_all_trust_info,
      });
    });
  });

  describe('mapBeneficialOwner method tests', () => {
    test('data not provided, should return empty object', () => {
      expect(mapBeneficialOwnerToPage(undefined, 0)).toEqual({});
    });

    test('mapBeneficialOwner should return object', () => {
      const expectId = 999;
      const objInSession = {
        forename: 'dummyForename',
        other_forenames: 'dummyOtherForename',
        surname: 'dummySurName',
        notified_date_day: '90',
        notified_date_month: '80',
        notified_date_year: '2070',
        ceased_date_day: '91',
        ceased_date_month: '81',
        ceased_date_year: '2071',
      } as Trust.TrustHistoricalBeneficialOwner;

      const actual = mapBeneficialOwnerToPage(objInSession, expectId);

      expect(actual).toEqual({
        id: String(expectId),
        forename: objInSession.forename,
        otherForenames: objInSession.other_forenames,
        surname: objInSession.surname,
        ceasedDateDay: objInSession.ceased_date_day,
        ceasedDateMonth: objInSession.ceased_date_month,
        ceasedDateYear: objInSession.ceased_date_year,
        notifiedDateDay: objInSession.notified_date_day,
        notifiedDateMonth: objInSession.notified_date_month,
        notifiedDateYear: objInSession.notified_date_year,
      });
    });
  });
});
