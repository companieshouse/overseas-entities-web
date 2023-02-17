import { describe, expect, test } from '@jest/globals';
import {
  addTrustToBeneficialOwner,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  getTrustBoIndividuals,
  getTrustBoOthers,
  getTrustByIdFromApp,
  saveHistoricalBoInTrust,
  saveIndividualTrusteeInTrust,
  saveTrustInApp,
  saveLegalEntityBoInTrust,
  getIndividualTrusteesFromTrust,
  getFormerTrusteesFromTrust,
} from '../../src/utils/trusts';
import { ApplicationData } from '../../src/model';
import { NatureOfControlType } from '../../src/model/data.types.model';
import { Trust, TrustBeneficialOwner, TrustHistoricalBeneficialOwner, TrustKey, TrustCorporate, IndividualTrustee } from '../../src/model/trust.model';
import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKey,
} from '../../src/model/beneficial.owner.individual.model';
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from '../../src/model/beneficial.owner.other.model';
import { TrustIndividual } from '@companieshouse/api-sdk-node/dist/services/overseas-entities';

describe('Trust Utils method tests', () => {
  const trustId = 'dummyExistsTrustId';
  const newTrustId = 'dummyTrustId';

  const mockTrust1Data = {
    trust_id: '999',
  } as Trust;

  const mockTrust2Data = {
    trust_id: '802',
    trust_name: 'dummyName',
  } as Trust;

  const mockBoIndividual1 = {
    id: '9001',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
    trust_ids: [
      trustId,
    ],
  } as BeneficialOwnerIndividual;

  const mockBoIndividual2 = {
    id: '9002',
  } as BeneficialOwnerIndividual;

  const mockBoOle1 = {
    id: '8001',
  } as BeneficialOwnerOther;

  const mockBoOle2 = {
    id: '8002',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
    trust_ids: [
      trustId,
    ],
  } as BeneficialOwnerOther;

  let mockAppData = {};

  beforeEach(() => {
    jest.resetAllMocks();

    mockAppData = {
      [TrustKey]: [
        mockTrust1Data,
        mockTrust2Data,
      ],
      [BeneficialOwnerIndividualKey]: [
        mockBoIndividual1,
        {} as BeneficialOwnerIndividual,
        mockBoIndividual2,
      ],
      [BeneficialOwnerOtherKey]: [
        {} as BeneficialOwnerOther,
        mockBoOle1,
        mockBoOle2,
      ],
    } as ApplicationData;
  });

  test('test get Bo Individuals assignable to Trust', () => {
    expect(getBoIndividualAssignableToTrust(mockAppData)).toEqual([mockBoIndividual1]);
  });

  test('test get Bo other legal assigned to trust', () => {
    expect(getTrustBoIndividuals(mockAppData, trustId)).toEqual([mockBoIndividual1]);
  });

  test('test get Bo other legal assignable to Trust', () => {
    expect(getBoOtherAssignableToTrust(mockAppData)).toEqual([mockBoOle2]);
  });

  test('test get Bo other legal assigned to trust', () => {
    expect(getTrustBoOthers(mockAppData, trustId)).toEqual([mockBoOle2]);
  });

  test('test addTrustToBeneficialOwner, did not assigned to trust before', () => {
    const mockBo = {
      id: '9999',
    } as TrustBeneficialOwner;

    expect(addTrustToBeneficialOwner(mockBo, newTrustId)).toEqual({
      ...mockBo,
      trust_ids: [newTrustId],
    });
  });

  test('test addTrustToBeneficialOwner, already assigned to trust before', () => {
    const mockBo = {
      id: '9999',
      trust_ids: ['existsTrustId1'],
    } as TrustBeneficialOwner;

    expect(addTrustToBeneficialOwner(mockBo, newTrustId)).toEqual({
      ...mockBo,
      trust_ids: [
        ...mockBo.trust_ids!,
        newTrustId,
      ],
    });
  });

  test('test getTrustByIdFromApp', () => {
    expect(getTrustByIdFromApp(mockAppData, mockTrust2Data.trust_id)).toEqual(mockTrust2Data);
  });

  describe('test Save Trust in Application data', () => {
    const newTrust = {
      trust_id: 'newTrust',
    } as Trust;

    test('test add', () => {
      const actual = saveTrustInApp(mockAppData, newTrust);

      expect(actual).toEqual(expect.objectContaining({
        trusts: [
          mockTrust1Data,
          mockTrust2Data,
          newTrust,
        ],
      }));
    });

    test('test update', () => {
      const updatedTrust = {
        ...mockTrust1Data,
        creation_date_day: 'XXX',
      };

      const actual = saveTrustInApp(mockAppData, updatedTrust);

      expect(actual).toEqual(expect.objectContaining({
        trusts: [
          mockTrust2Data,
          updatedTrust,
        ],
      }));
    });
  });

  describe('test Save Historical Beneficial Owner in Trust', () => {
    const expectBo1 = {
      id: '110',
    } as TrustHistoricalBeneficialOwner;
    const expectBo2 = {
      id: '111',
    } as TrustHistoricalBeneficialOwner;

    let mockTrust = {} as Trust;

    beforeEach(() => {
      mockTrust = {
        trust_id: '999',
        HISTORICAL_BO: [
          expectBo1,
          expectBo2,
        ],
      } as Trust;
    });

    test('test add', () => {
      const newBo = {
        id: '101',
      } as TrustHistoricalBeneficialOwner;

      const actual = saveHistoricalBoInTrust(mockTrust, newBo);

      expect(actual).toEqual({
        ...mockTrust,
        HISTORICAL_BO: [
          expectBo1,
          expectBo2,
          newBo,
        ],
      });
    });

    test('test update', () => {
      const updatedBo = {
        ...expectBo1,
        corporateName: 'dummy',
      };

      const actual = saveHistoricalBoInTrust(mockTrust, updatedBo);

      expect(actual).toEqual({
        ...mockTrust,
        HISTORICAL_BO: [
          expectBo2,
          updatedBo,
        ],
      });
    });
  });

  describe('test Save Legal Entity Beneficial Owner in Trust', () => {
    const expectLe1 = {
      id: '998',
    } as TrustCorporate;
    const expectLe2 = {
      id: '997',
    } as TrustCorporate;

    let mockTrust = {} as Trust;

    beforeEach(() => {
      mockTrust = {
        trust_id: '900',
        CORPORATES: [
          expectLe1,
          expectLe2,
        ],
      } as Trust;
    });

    test('test add new Legal Entity Trustee', () => {
      const newLe = {
        id: '1000',
      } as TrustCorporate;

      const actual = saveLegalEntityBoInTrust(mockTrust, newLe);

      expect(actual).toEqual({
        ...mockTrust,
        CORPORATES: [
          expectLe1,
          expectLe2,
          newLe,
        ],
      });
    });
  });
  describe('test Save Individual Beneficial Owner trustee in Trust', () => {
    const expectTrustee1 = {
      id: '110',
    } as TrustIndividual;
    const expectTrustee2 = {
      id: '111',
    } as TrustIndividual;

    let mockTrust = {} as Trust;

    beforeEach(() => {
      mockTrust = {
        trust_id: '1000',
        INDIVIDUALS: [
          expectTrustee1,
          expectTrustee2,
        ],
      } as Trust;
    });

    test('test add', () => {
      const trustee = {
        id: '101',
      } as IndividualTrustee;

      const actual = saveIndividualTrusteeInTrust(mockTrust, trustee);

      expect(actual).toEqual({
        ...mockTrust,
        INDIVIDUALS: [
          expectTrustee1,
          expectTrustee2,
          trustee,
        ],
      });
    });

    test("test getTrusteeFromTrust with application data and trust id", () => {
      const test_trust_id = '247';
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'INDIVIDUALS': [{}, {}, {}] as TrustIndividual[],
        }]
      } as ApplicationData;

      const result = getIndividualTrusteesFromTrust(appData, test_trust_id);
      expect(result.length).toEqual(3);
      expect(result).toEqual([{}, {}, {}]);
    });

    test("test getTrusteeFromTrust with application data and no trust id", () => {
      const appData = {
        [TrustKey]: [{
          'INDIVIDUALS': [{}, {}, {}] as TrustIndividual[],
        }, {
          'INDIVIDUALS': [{}, {}, {}] as TrustIndividual[],
        }]
      } as ApplicationData;

      const result = getIndividualTrusteesFromTrust(appData);
      expect(result.length).toEqual(6);
      expect(result).toEqual([{}, {}, {}, {}, {}, {}]);
    });

    test("test getFormerTrusteesFromTrust with application data and trust id", () => {
      const test_trust_id = '353';
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'HISTORICAL_BO': [{}, {}, {}] as TrustHistoricalBeneficialOwner[],
        }]
      } as ApplicationData;

      const result = getFormerTrusteesFromTrust(appData, test_trust_id);
      expect(result.length).toEqual(3);
      expect(result).toEqual([{}, {}, {}]);
    });

    test("test getFormerTrusteesFromTrust with application data and no trust id", () => {
      const appData = {
        [TrustKey]: [{
          'HISTORICAL_BO': [{}, {}, {}] as TrustHistoricalBeneficialOwner[],
        }, {
          'HISTORICAL_BO': [{}, {}, {}] as TrustHistoricalBeneficialOwner[],
        }]
      } as ApplicationData;

      const result = getFormerTrusteesFromTrust(appData);
      expect(result.length).toEqual(6);
      expect(result).toEqual([{}, {}, {}, {}, {}, {}]);
    });
  });
});
