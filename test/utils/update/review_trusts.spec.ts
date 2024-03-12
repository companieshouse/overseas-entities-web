import { ApplicationData } from '../../../src/model';
import { Trust, TrustCorporate, TrustHistoricalBeneficialOwner, TrustIndividual } from '../../../src/model/trust.model';
import { TrusteeType } from '../../../src/model/trustee.type.model';
import { UpdateKey } from '../../../src/model/update.type.model';
import {
  hasTrustsToReview,
  getTrustInReview,
  hasTrusteesToReview,
  getTrusteeIndex,
  getTrustee,
  setTrusteesAsReviewed,
  updateTrustInReviewList,
  getReviewTrustById,
  putNextTrustInReview,
  setTrustDetailsAsReviewed,
  moveTrustOutOfReview,
  putTrustInChangeScenario,
  moveReviewableTrustsIntoReview,
} from '../../../src/utils/update/review_trusts';

describe('Manage trusts - review trusts utils tests', () => {
  describe('hasTrustsToReview', () => {
    test.each([
      [ 'no update in model', undefined ],
      [ 'no review trusts', { review_trusts: undefined } ],
      [ 'review trusts is empty', { review_trusts: [] } ],
    ])('will return false when there is %s', (_, update) => {
      const appData = { update };

      const result = hasTrustsToReview(appData);

      expect(result).toBe(false);
    });

    test('will return true when there are some trusts to review', () => {
      const appData = { update: { review_trusts: [{} as Trust] } };

      const result = hasTrustsToReview(appData);

      expect(result).toBe(true);
    });
  });

  describe('getTrustInReview', () => {
    test.each([
      [ 'no update in model', undefined ],
      [ 'no review trusts', { review_trusts: undefined } ],
      [ 'review trusts is empty', { review_trusts: [] } ],
      [ 'review trusts has no trust in review', { review_trusts: [{ review_status: { in_review: false } } as Trust] }],
    ])('will return undefined when there is %s', (_, update) => {
      const appData = { update };

      const result = getTrustInReview(appData);

      expect(result).toBe(undefined);
    });

    test('will return true when there is a trust in review', () => {
      const trust = { review_status: { in_review: true } } as Trust;
      const appData = { update: { review_trusts: [trust] } };

      const result = getTrustInReview(appData);

      expect(result).toBe(trust);
    });
  });

  describe('putNextTrustInReview', () => {
    test.each([
      [ 'there is no update in model', undefined ],
      [ 'there is no review trusts in model', { review_trusts: undefined } ],
      [ 'review trusts is empty', { review_trusts: [] } ],
    ])('will return undefined when %s', (_, update) => {
      const appData = { update };

      const result = putNextTrustInReview(appData);

      expect(result).toBe(undefined);
    });

    test('will return the next trust when there is one to review, and setup its review_status', () => {
      const trust = { trust_name: 'Trust 1' } as Trust;
      const expectedTrust = {
        ...trust,
        review_status: {
          in_review: true,
          reviewed_trust_details: false,
          reviewed_former_bos: false,
          reviewed_individuals: false,
          reviewed_legal_entities: false,
        },
      };

      const appData = { update: { review_trusts: [trust] } };

      const result = putNextTrustInReview(appData);

      expect(result).toEqual(expectedTrust);
    });
  });

  describe('setTrustDetailsAsReviewed', () => {
    test.each([
      [ 'there is no update in model', undefined ],
      [ 'there is no review trusts', { review_trusts: undefined } ],
      [ 'review trusts is empty', { review_trusts: [] } ],
      [ 'there is no review_status in trust', { review_trusts: [{ trust_name: 'Trust 1' }] } ],
    ])('will return false when %s', (_, update) => {
      const appData = { update } as ApplicationData;

      const result = setTrustDetailsAsReviewed(appData);

      expect(result).toBe(false);
    });

    test('will return true when there is a trust, with review_status, and set its reviewed_trust_details to true', () => {
      const trust = { trust_name: 'Trust 1', review_status: {
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      } } as Trust;
      const appData = { update: { review_trusts: [trust] } };

      const result = setTrustDetailsAsReviewed(appData);

      expect(result).toBe(true);
      expect(trust.review_status).toEqual({
        in_review: true,
        reviewed_trust_details: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });
  });

  describe('hasTrusteesToReview', () => {
    test('when checking former bos, and former bos are reviewed, with no former bos, returns false', () => {
      const trusteeType = TrusteeType.HISTORICAL;
      const trust = {
        review_status: { reviewed_former_bos: true },
        HISTORICAL_BO: [] as TrustHistoricalBeneficialOwner[],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking former bos, and former bos are reviewed, with former bos, returns false', () => {
      const trusteeType = TrusteeType.HISTORICAL;
      const trust = {
        review_status: { reviewed_former_bos: true },
        HISTORICAL_BO: [{}],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking former bos, and former bos are not reviewed, with no former bos, returns false', () => {
      const trusteeType = TrusteeType.HISTORICAL;
      const trust = {
        review_status: { reviewed_former_bos: false },
        HISTORICAL_BO: [] as TrustHistoricalBeneficialOwner[],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking former bos, and former bos are not reviewed, with former bos, returns true', () => {
      const trusteeType = TrusteeType.HISTORICAL;
      const trust = {
        review_status: { reviewed_former_bos: false },
        HISTORICAL_BO: [{}],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(true);
    });

    test('when checking individuals, and individuals are reviewed, with no individuals, returns false', () => {
      const trusteeType = TrusteeType.INDIVIDUAL;
      const trust = {
        review_status: { reviewed_individuals: true },
        INDIVIDUALS: [] as TrustIndividual[],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking individuals, and individuals are reviewed, with individuals, returns false', () => {
      const trusteeType = TrusteeType.INDIVIDUAL;
      const trust = {
        review_status: { reviewed_individuals: true },
        INDIVIDUALS: [{}],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking individuals, and individuals are not reviewed, with no individuals, returns false', () => {
      const trusteeType = TrusteeType.INDIVIDUAL;
      const trust = {
        review_status: { reviewed_individuals: false },
        INDIVIDUALS: [] as TrustIndividual[],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking individuals, and individuals are not reviewed, with individuals, returns true', () => {
      const trusteeType = TrusteeType.INDIVIDUAL;
      const trust = {
        review_status: { reviewed_individuals: false },
        INDIVIDUALS: [{}],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(true);
    });

    test('when checking legal entities, and legal entities are reviewed, with no legal entities, returns false', () => {
      const trusteeType = TrusteeType.LEGAL_ENTITY;
      const trust = {
        review_status: { reviewed_legal_entities: true },
        CORPORATES: [] as TrustCorporate[],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking legal entities, and legal entities are reviewed, with legal entities, returns false', () => {
      const trusteeType = TrusteeType.LEGAL_ENTITY;
      const trust = {
        review_status: { reviewed_legal_entities: true },
        CORPORATES: [{}],
      } as Trust;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking legal entities, and legal entities are not reviewed, with no legal entities, returns false', () => {
      const trusteeType = TrusteeType.LEGAL_ENTITY;
      const trust = {
        review_status: { reviewed_legal_entities: false },
        CORPORATES: [] as TrustCorporate[],
      };

      const result = hasTrusteesToReview(trust as Trust, trusteeType);

      expect(result).toBe(false);
    });

    test('when checking legal entities, and legal entities are not reviewed, with legal entities, returns true', () => {
      const trusteeType = TrusteeType.LEGAL_ENTITY;
      const trust = {
        review_status: { reviewed_legal_entities: false },
        CORPORATES: [{}],
      } as any;

      const result = hasTrusteesToReview(trust, trusteeType);

      expect(result).toBe(true);
    });

    test.each([
      ['former bos', { review_status: { reviewed_former_bos: false }, HISTORICAL_BO: [{}] }],
      ['individuals', { review_status: { reviewed_individuals: false }, INDIVIDUALS: [{}] }],
      ['legal entities', { review_status: { reviewed_legal_entities: false }, CORPORATES: [{}] }],
    ])('when trustee type is invalid, with %s to review, returns false', (_, trust) => {
      const result = hasTrusteesToReview(trust as Trust, 'carrot' as any);

      expect(result).toBe(false);
    });
  });

  describe('getTrusteeIndex', () => {
    test.each([
      ['former bo', TrusteeType.HISTORICAL],
      ['individual', TrusteeType.INDIVIDUAL],
      ['legal entity', TrusteeType.LEGAL_ENTITY],
    ])('when trust is undefined, getting the index of a %s, returns -1', (_, trusteeType) => {
      const result = getTrusteeIndex(undefined, '', trusteeType);

      expect(result).toBe(-1);
    });

    test.each([
      ['former bos', { HISTORICAL_BO: [] as TrustHistoricalBeneficialOwner[] }, TrusteeType.HISTORICAL],
      ['individuals', { INDIVIDUALS: [] as TrustIndividual[] }, TrusteeType.INDIVIDUAL],
      ['legal entities', { CORPORATES: [] as TrustCorporate[] }, TrusteeType.LEGAL_ENTITY],
    ])('when there are no %s, searching for one returns -1', (_, trust, trusteeType) => {
      const result = getTrusteeIndex(trust as Trust, '', trusteeType);

      expect(result).toBe(-1);
    });

    test.each([
      ['former bos', { HISTORICAL_BO: [{ id: 'tomatoes' }] }, TrusteeType.HISTORICAL],
      ['individuals', { INDIVIDUALS: [{ id: 'carrots' }] }, TrusteeType.INDIVIDUAL],
      ['legal entities', { CORPORATES: [{ id: 'onions' }] }, TrusteeType.LEGAL_ENTITY],
    ])('when there are %s, searching for an id that does not exist returns -1', (_, trust, trusteeType) => {
      const result = getTrusteeIndex(trust as Trust, 'parsnip', trusteeType);

      expect(result).toBe(-1);
    });

    test.each([
      ['former bos', { HISTORICAL_BO: [{ id: 'tomatoes' }, { id: 'peaches' }] }, 0, TrusteeType.HISTORICAL],
      ['individuals', { INDIVIDUALS: [{ id: 'carrots' }, { id: 'tomatoes' }] }, 1, TrusteeType.INDIVIDUAL],
      ['legal entities', { CORPORATES: [{ id: 'onions' }, { id: 'bananas' }, { id: 'tomatoes' }] }, 2, TrusteeType.LEGAL_ENTITY],
    ])('when there are %s, searching for an id that does exist returns the index', (_, trust, expectedIndex, trusteeType) => {
      const result = getTrusteeIndex(trust as Trust, 'tomatoes', trusteeType);

      expect(result).toBe(expectedIndex);
    });
  });

  describe('getTrustee', () => {
    test.each([
      [' former bo', TrusteeType.HISTORICAL],
      ['n individual', TrusteeType.INDIVIDUAL],
      [' legal entity', TrusteeType.LEGAL_ENTITY],
    ])('when trust is undefined, getting a%s, returns undefined', (_, trusteeType) => {
      const result = getTrustee(undefined, '', trusteeType);

      expect(result).toBe(undefined);
    });

    test.each([
      ['former bos', { HISTORICAL_BO: [] as TrustHistoricalBeneficialOwner[] }, TrusteeType.HISTORICAL],
      ['individuals', { INDIVIDUALS: [] as TrustIndividual[] }, TrusteeType.INDIVIDUAL],
      ['legal entities', { CORPORATES: [] as TrustCorporate[] }, TrusteeType.LEGAL_ENTITY],
    ])('when there are no %s, searching for one returns undefined', (_, trust, trusteeType) => {
      const result = getTrustee(trust as Trust, '', trusteeType);

      expect(result).toBe(undefined);
    });

    test.each([
      ['former bos', { HISTORICAL_BO: [{ id: 'tomatoes' }] }, TrusteeType.HISTORICAL],
      ['individuals', { INDIVIDUALS: [{ id: 'carrots' }] }, TrusteeType.INDIVIDUAL],
      ['legal entities', { CORPORATES: [{ id: 'onions' }] }, TrusteeType.LEGAL_ENTITY],
    ])('when there are %s, searching for an id that does not exist returns undefined', (_, trust, trusteeType) => {
      const result = getTrustee(trust as Trust, 'parsnip', trusteeType);

      expect(result).toBe(undefined);
    });

    test('when there are former bo trustees, searching for an id of one that exists, returns the trustee', () => {
      const expectedTrustee = { id: 'expected-former-bo' };
      const trust = { HISTORICAL_BO: [{ id: 'unexpected-former-bo' }, expectedTrustee] };

      const result = getTrustee(trust as Trust, 'expected-former-bo', TrusteeType.HISTORICAL);

      expect(result).toBe(expectedTrustee);
    });

    test('when there are individual trustees, searching for an id of one that exists, returns the trustee', () => {
      const expectedTrustee = { id: 'expected-individual' };
      const trust = { INDIVIDUALS: [{ id: 'unexpected-individual' }, expectedTrustee, { id: 'unexpected-individual-1' }] };

      const result = getTrustee(trust as Trust, 'expected-individual', TrusteeType.INDIVIDUAL);

      expect(result).toBe(expectedTrustee);
    });

    test('when there are legal entity trustees, searching for an id of one that exists, returns the trustee', () => {
      const expectedTrustee = { id: 'expected-legal-entity' };
      const trust = { CORPORATES: [{ id: 'unexpected-legal-entity' }, { id: 'unexpected-legal-entity-1' }, expectedTrustee] };

      const result = getTrustee(trust as Trust, 'expected-legal-entity', TrusteeType.LEGAL_ENTITY);

      expect(result).toBe(expectedTrustee);
    });
  });

  describe('setTrusteesAsReviewed', () => {
    test('when no trust is in review, returns false, and trust remains unchanged', () => {
      const review_status = {
        in_review: false,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, '' as any);

      expect(result).toBe(false);
      expect(review_status).toEqual({
        in_review: false,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is unknown, returns false, and trust remains unchanged', () => {
      const review_status = {
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, '' as any);

      expect(result).toBe(false);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is former bos, returns true, and reviewed former bos is true', () => {
      const review_status = {
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, TrusteeType.HISTORICAL);

      expect(result).toBe(true);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: true,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is individuals, returns true, and reviewed individuals is true', () => {
      const review_status = {
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, TrusteeType.INDIVIDUAL);

      expect(result).toBe(true);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: true,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is legal entity, returns true, and reviewed legal entities is true', () => {
      const review_status = {
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, TrusteeType.LEGAL_ENTITY);

      expect(result).toBe(true);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_trust_details: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: true,
      });
    });
  });

  describe('updateTrustInReviewList', () => {
    test ('that new trust data is saved to application data', () => {
      const trustData = {
        trust_id: '1',
        trust_name: 'Existing Trust',
        creation_date_day: '01',
        creation_date_month: '02',
        creation_date_year: '2001',
        unable_to_obtain_all_trust_info: 'No',
      } as Trust;

      const reviewedTrustData = {
        trust_id: '1',
        trust_name: 'Reviewed Trust',
        creation_date_day: '02',
        creation_date_month: '03',
        creation_date_year: '2004',
        unable_to_obtain_all_trust_info: 'Yes',
      } as Trust;

      const appData = { update: { no_change: false, review_trusts: [trustData] } };
      const expectedAppData = { update: { no_change: false, review_trusts: [reviewedTrustData] } };

      updateTrustInReviewList(appData, reviewedTrustData);

      expect(appData).toEqual(expectedAppData);
    });
  });

  describe('getReviewTrustById', () => {
    test ('test that correct trust is returned', () => {
      const reviewTrustData = {
        trust_id: '1',
        trust_name: 'Test Trust',
        creation_date_day: '12',
        creation_date_month: '6',
        creation_date_year: '2023',
        unable_to_obtain_all_trust_info: 'No',
      } as Trust;

      const appData = { update: { review_trusts: [reviewTrustData] } };

      expect(getReviewTrustById(appData, reviewTrustData.trust_id)).toEqual(reviewTrustData);
    });
  });
});

describe('moveTrustOutOfReview', () => {
  test('when trust to review, sets review_status of trust to undefined and adds it to trusts list in application data', () => {

    const review_status = {
      in_review: true,
      reviewed_trust_details: false,
      reviewed_former_bos: false,
      reviewed_individuals: false,
      reviewed_legal_entities: false,
    };

    const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

    moveTrustOutOfReview(appData);

    // trust.review_status set to undefined, trust added to trusts list in app data
    expect(appData.trusts).toEqual( [{ review_status: undefined }] );
  });

  test('when trusts undefined, sets as empty array', () => {

    const review_status = {
      in_review: true,
      reviewed_trust_details: false,
      reviewed_former_bos: false,
      reviewed_individuals: false,
      reviewed_legal_entities: false,
    };

    const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

    moveTrustOutOfReview(appData);

    // appData set to [] if undefined
    expect(appData.trusts).toEqual([{}]);
  });
});

describe('putTrustInChangeScenario', () => {
  test('moves trust from main model to review_trusts', () => {
    const appData = {
      trusts: [{ trust_id: '1', trust_name: 'trust name' } as Trust],
      [UpdateKey]: {
        review_trusts: []
      }
    };

    putTrustInChangeScenario(appData, '1');
  });
});

describe('moveReviewableTrustsIntoReview', () => {
  test('moves trusts with ch_reference attribute from appData.trusts to appData.update.review_trusts', () => {
    const trust1 = {
      trust_id: "1",
      trust_name: "Trust one with ch_reference",
      ch_reference: "123",
    } as Trust;

    const trust2 = {
      trust_id: "2",
      trust_name: "Trust two",
    } as Trust;

    const trust3 = {
      trust_id: "3",
      trust_name: "Trust three with ch_reference",
      ch_reference: "456",
    } as Trust;

    const trust4 = {
      trust_id: "4",
      trust_name: "Trust four",
    } as Trust;

    const appData: ApplicationData = {
      trusts: [
        trust1,
        trust2,
        trust3,
        trust4
      ],
      update: { }
    };

    moveReviewableTrustsIntoReview(appData);

    expect(appData.trusts?.length).toEqual(2);
    expect(appData.update?.review_trusts?.length).toEqual(2);

    expect(appData.update?.review_trusts).toContain(trust1);
    expect(appData.update?.review_trusts).toContain(trust3);

    expect(appData.trusts).toContain(trust2);
    expect(appData.trusts).toContain(trust4);

    const reviewTrust1 = appData.update?.review_trusts?.find(trust => trust.trust_id === "1");
    expect(reviewTrust1?.review_status?.in_review).toEqual(false);
    expect(reviewTrust1?.review_status?.reviewed_trust_details).toEqual(false);
    expect(reviewTrust1?.review_status?.reviewed_former_bos).toEqual(false);
    expect(reviewTrust1?.review_status?.reviewed_individuals).toEqual(false);
    expect(reviewTrust1?.review_status?.reviewed_legal_entities).toEqual(false);

    const reviewTrust3 = appData.update?.review_trusts?.find(trust => trust.trust_id === "3");
    expect(reviewTrust3?.review_status?.in_review).toEqual(false);
    expect(reviewTrust3?.review_status?.reviewed_trust_details).toEqual(false);
    expect(reviewTrust3?.review_status?.reviewed_former_bos).toEqual(false);
    expect(reviewTrust3?.review_status?.reviewed_individuals).toEqual(false);
    expect(reviewTrust3?.review_status?.reviewed_legal_entities).toEqual(false);

    const addedTrust2 = appData.trusts?.find(trust => trust.trust_id === "2");
    expect(addedTrust2?.review_status).toBeUndefined();

    const addedTrust4 = appData.trusts?.find(trust => trust.trust_id === "4");
    expect(addedTrust4?.review_status).toBeUndefined();
  });

  test('should not move trusts from appData.trusts to appData.update.review_trusts if they don`t have ch_reference', () => {
    const trust1 = {
      trust_id: "1",
      trust_name: "Trust one",
    } as Trust;

    const trust2 = {
      trust_id: "2",
      trust_name: "Trust two",
    } as Trust;

    const trust3 = {
      trust_id: "3",
      trust_name: "Trust three with ch_reference",
      ch_reference: "456",
    } as Trust;

    const trust4 = {
      trust_id: "4",
      trust_name: "Trust four with ch_reference",
      ch_reference: "123",
    } as Trust;

    const appData: ApplicationData = {
      trusts: [
        trust1,
        trust2,
      ],
      update: {
        review_trusts: [
          trust3,
          trust4
        ]
      }
    };

    expect(appData.trusts?.length).toEqual(2);
    expect(appData.update?.review_trusts?.length).toEqual(2);

    expect(appData.update?.review_trusts).toContain(trust3);
    expect(appData.update?.review_trusts).toContain(trust4);

    expect(appData.trusts).toContain(trust1);
    expect(appData.trusts).toContain(trust2);
  });

  test('should throw error if no update object exists when trying to move trusts', () => {
    const appData = {
      trusts: []
    } as ApplicationData;

    expect(() => moveReviewableTrustsIntoReview(appData)).toThrowError("No update object exists on appData when trying to move trusts back into review");
  });
});
