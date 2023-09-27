import { ApplicationData } from '../../../src/model';
import { Trust, TrustCorporate, TrustHistoricalBeneficialOwner, TrustIndividual } from '../../../src/model/trust.model';
import { TrusteeType } from '../../../src/model/trustee.type.model';
import { hasTrustsToReview, getTrustInReview, putTrustInReview, hasTrusteesToReview, getTrusteeIndex, getTrustee, setTrusteesAsReviewed } from '../../../src/utils/update/review_trusts';

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

  describe('putTrustInReview', () => {
    test.each([
      [ 'no update in model', undefined ],
      [ 'no review trusts', { review_trusts: undefined } ],
      [ 'review trusts is empty', { review_trusts: [] } ],
    ])('will return false when there is %s', (_, update) => {
      const appData = { update };

      const result = putTrustInReview(appData);

      expect(result).toBe(false);
    });

    test('will return true when there is a trust, and set its in_review status to true', () => {
      const trust = { review_status: { in_review: false } } as Trust;
      const appData = { update: { review_trusts: [trust] } };

      const result = putTrustInReview(appData);

      expect(result).toBe(true);
      expect(trust.review_status?.in_review).toBe(true);
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
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, '' as any);

      expect(result).toBe(false);
      expect(review_status).toEqual({
        in_review: false,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is unknown, returns false, and trust remains unchanged', () => {
      const review_status = {
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, '' as any);

      expect(result).toBe(false);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is former bos, returns true, and reviewed former bos is true', () => {
      const review_status = {
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, TrusteeType.HISTORICAL);

      expect(result).toBe(true);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_former_bos: true,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is individuals, returns true, and reviewed individuals is true', () => {
      const review_status = {
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, TrusteeType.INDIVIDUAL);

      expect(result).toBe(true);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: true,
        reviewed_legal_entities: false,
      });
    });

    test('when trust is in review, and trustee type is legal entity, returns true, and reviewed legal entities is true', () => {
      const review_status = {
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: false,
      };
      const appData = { update: { review_trusts: [{ review_status }] } } as ApplicationData;

      const result = setTrusteesAsReviewed(appData, TrusteeType.LEGAL_ENTITY);

      expect(result).toBe(true);
      expect(review_status).toEqual({
        in_review: true,
        reviewed_former_bos: false,
        reviewed_individuals: false,
        reviewed_legal_entities: true,
      });
    });
  });
});
