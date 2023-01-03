import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as Trust from '../../../src/model/trust.model';
import { mapTrustWhoIsInvolvedToPage  } from "../../../src/utils/trust/who.is.involved.mapper";

describe('Trust Involved Mapper to Page Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapTrustWhoIsInvolvedToPage method tests', () => {
    test('data is not provided, should return empty object', () => {
      expect(mapTrustWhoIsInvolvedToPage(undefined)).toEqual({});
    });

    test('mapTrustWhoIsInvolvedToPage should return object with mapped data', () => {
      const objInSession = {
        trust_id: '999',
        trust_name: 'dummyName',
      } as Trust.Trust;

      expect(mapTrustWhoIsInvolvedToPage(objInSession)).toEqual({
        id: objInSession.trust_id,
        trustName: objInSession.trust_name,
      });
    });
  });
});
