import * as Page from '../../../src/model/trust.page.model';
import { mapDetailToSession } from "../../../src/utils/trust/mapper.to.session";

describe('Trust Mapper to Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapDetail method tests', () => {
    test('mapDetail should return object', () => {
      const objIOnPage = {
        id: '999',
        name: 'dummyName',
        createdDateDay: '99',
        createdDateMonth: '88',
        createdDateYear: '2077',
        beneficialOwners: [],
        hasAllInfo: '1',
      } as Page.TrustDetails;

      expect(mapDetailToSession(objIOnPage)).toEqual({
        trust_id: objIOnPage.id,
        trust_name: objIOnPage.name,
        creation_date_day: objIOnPage.createdDateDay,
        creation_date_month: objIOnPage.createdDateMonth,
        creation_date_year: objIOnPage.createdDateYear,
        unable_to_obtain_all_trust_info: objIOnPage.hasAllInfo,
      });
    });
  });
});
