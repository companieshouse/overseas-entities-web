jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/url');

import { describe, expect, test } from '@jest/globals';
import { TRUST_DETAILS_URL, TRUST_INTERRUPT_URL, TRUST_ENTRY_URL, ADD_TRUST_URL, TRUST_ENTRY_WITH_PARAMS_URL } from "../../src/config";
import {
  addTrustToBeneficialOwner,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
  getTrustBoIndividuals,
  getTrustBoOthers,
  getTrustByIdFromApp,
  getTrustArray,
  saveHistoricalBoInTrust,
  saveIndividualTrusteeInTrust,
  saveTrustInApp,
  saveLegalEntityBoInTrust,
  getIndividualTrusteesFromTrust,
  getIndividualTrustee,
  getFormerTrusteesFromTrust,
  checkEntityRequiresTrusts,
  checkEntityReviewRequiresTrusts,
  getTrustLandingUrl,
  getLegalEntityBosInTrust,
  getLegalEntityTrustee,
  getFormerTrustee,
  mapTrustApiReturnModelToWebModel,
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
import { isActiveFeature } from '../../src/utils/feature.flag';
import { Request } from 'express';
import { getUrlWithParamsToPath } from '../../src/utils/url';

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(false);

const MOCKED_URL = "MOCKED_URL";
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;
mockGetUrlWithParamsToPath.mockReturnValue(MOCKED_URL);

const mockRequest = {} as Request;

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

  const mockBoCeasedIndividualWithTrusteeNoc = {
    id: '9003',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
    trust_ids: [
      trustId,
    ],
    ceased_date: {
      day: "1",
      month: "2",
      year: "2020"
    }
  } as BeneficialOwnerIndividual;

  const mockBoCeasedIndividualWithTrusteeNocRelevantPeriod = {
    id: '9003',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
    trust_ids: [
      trustId,
    ],
    ceased_date: {
      day: "1",
      month: "2",
      year: "2020"
    },
    relevant_period: true
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

  const mockBoCeasedOleWithTrusteeNoc = {
    id: '8003',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
    trust_ids: [
      trustId,
    ],
    ceased_date: {
      day: "1",
      month: "2",
      year: "2020"
    }
  } as BeneficialOwnerOther;

  const mockBoCeasedOleWithTrusteeNocRelevantPeriod = {
    id: '8003',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
    trust_ids: [
      trustId,
    ],
    ceased_date: {
      day: "1",
      month: "2",
      year: "2020"
    },
    relevant_period: true
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
    const mockAppDataWithACeasedIndividualBO = {
      ...mockAppData
    };
    mockAppDataWithACeasedIndividualBO[BeneficialOwnerIndividualKey].push(mockBoCeasedIndividualWithTrusteeNoc);

    expect(getBoIndividualAssignableToTrust(mockAppDataWithACeasedIndividualBO)).toEqual([mockBoIndividual1]);
  });

  test('test get Bo Individuals assignable to Trust with relevant period', () => {
    const mockAppDataWithACeasedIndividualBO = {
      ...mockAppData
    };
    mockAppDataWithACeasedIndividualBO[BeneficialOwnerIndividualKey].push(mockBoCeasedIndividualWithTrusteeNocRelevantPeriod);

    expect(getBoIndividualAssignableToTrust(mockAppDataWithACeasedIndividualBO)).toEqual([mockBoIndividual1, mockBoCeasedIndividualWithTrusteeNocRelevantPeriod]);
  });

  test('test get Bo other legal assigned to trust', () => {
    expect(getTrustBoIndividuals(mockAppData, trustId)).toEqual([mockBoIndividual1]);
  });

  test('test get Bo other legal assignable to Trust', () => {
    const mockAppDataWithACeasedOtherBO = {
      ...mockAppData
    };
    mockAppDataWithACeasedOtherBO[BeneficialOwnerOtherKey].push(mockBoCeasedOleWithTrusteeNoc);

    expect(getBoOtherAssignableToTrust(mockAppDataWithACeasedOtherBO)).toEqual([mockBoOle2]);
  });

  test('test get Bo other legal assignable to Trust with relevant period', () => {
    const mockAppDataWithACeasedOtherBO = {
      ...mockAppData
    };
    mockAppDataWithACeasedOtherBO[BeneficialOwnerOtherKey].push(mockBoCeasedOleWithTrusteeNocRelevantPeriod);

    expect(getBoOtherAssignableToTrust(mockAppDataWithACeasedOtherBO)).toEqual([mockBoOle2, mockBoCeasedOleWithTrusteeNocRelevantPeriod]);
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
        ...mockBo.trust_ids || [],
        newTrustId,
      ],
    });
  });

  test('test getTrustByIdFromApp', () => {
    expect(getTrustByIdFromApp(mockAppData, mockTrust2Data.trust_id)).toEqual(mockTrust2Data);
  });

  test('test getTrustArray', () => {
    expect(getTrustArray(mockAppData)).toEqual([mockTrust1Data, mockTrust2Data]);
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
          updatedTrust,
          mockTrust2Data,
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
        corporate_name: 'dummy',
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

    test("test getIndividualTrusteesFromTrust with application data and trust id", () => {
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

    test("test getIndividualTrusteesFromTrust with application data and no trust id", () => {
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

    test("test getIndividualTrusteeFromTrust successfully", () => {
      const test_trust_id = '342';
      const individualTrustee1 = { id: "999" } as IndividualTrustee;
      const individualTrustee2 = { id: "901" } as IndividualTrustee;
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'INDIVIDUALS': [ individualTrustee1, individualTrustee2 ] as TrustIndividual[],
        }]
      } as ApplicationData;

      const result = getIndividualTrustee(appData, test_trust_id, "999");
      expect(result).toEqual(individualTrustee1);
    });

    test("test getIndividualTrusteeFromTrust with application data with no trusteeId", () => {
      const test_trust_id = '342';
      const empty_trustee_id = '';
      const individualTrustee1 = { id: "999" } as IndividualTrustee;
      const individualTrustee2 = { id: "901" } as IndividualTrustee;
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'INDIVIDUALS': [ individualTrustee1, individualTrustee2 ] as TrustIndividual[],
        }]
      } as ApplicationData;

      const result = getIndividualTrustee(appData, test_trust_id, empty_trustee_id);
      expect(result).toEqual({});
    });

    test("test getIndividualTrusteeFromTrust with application data and INDIVIDUALS array is empty", () => {
      const test_trust_id = '342';
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'INDIVIDUALS': [] as TrustIndividual[],
        }]
      } as ApplicationData;

      const result = getIndividualTrustee(appData, test_trust_id, "999");
      expect(result).toEqual({});
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
      const empty_test_trust_id = '';
      const appData = {
        [TrustKey]: [{
          'HISTORICAL_BO': [{}, {}, {}] as TrustHistoricalBeneficialOwner[],
        }, {
          'HISTORICAL_BO': [{}, {}, {}] as TrustHistoricalBeneficialOwner[],
        }]
      } as ApplicationData;

      const result = getFormerTrusteesFromTrust(appData, empty_test_trust_id );
      expect(result).toEqual([]);
    });

    test("test getFormerTrustee from trust successfully", () => {
      const test_trust_id = '342';
      const formerEntityTrustee1 = { id: "999" } as TrustHistoricalBeneficialOwner;
      const formerEntityTrustee2 = { id: "901" } as TrustHistoricalBeneficialOwner;
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'HISTORICAL_BO': [ formerEntityTrustee1, formerEntityTrustee2 ] as TrustHistoricalBeneficialOwner[],
        }]
      } as ApplicationData;

      const result = getFormerTrustee(appData, test_trust_id, "999");
      expect(result).toEqual(formerEntityTrustee1);
    });

    test("test getFormerTrustee from trust with application data with no trusteeId", () => {
      const test_trust_id = '342';
      const empty_trustee_id = '';
      const formerEntityTrustee1 = { id: "999" } as TrustHistoricalBeneficialOwner;
      const formerEntityTrustee2 = { id: "901" } as TrustHistoricalBeneficialOwner;
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'HISTORICAL_BO': [ formerEntityTrustee1, formerEntityTrustee2 ] as TrustHistoricalBeneficialOwner[],
        }]
      } as ApplicationData;

      const result = getFormerTrustee(appData, test_trust_id, empty_trustee_id);
      expect(result).toEqual({});
    });

    test("test getFormerTrustee from trust with application data and HISTORICAL_BO array is empty", () => {
      const test_trust_id = '342';
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'HISTORICAL_BO': [] as TrustHistoricalBeneficialOwner[],
        }]
      } as ApplicationData;

      const result = getFormerTrustee(appData, test_trust_id, "999");
      expect(result).toEqual({});
    });

    test("test getLegalEntityBosInTrust with application data and trust id", () => {
      const test_trust_id = '353';
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'CORPORATES': [{}, {}, {}] as TrustCorporate[],
        }]
      } as ApplicationData;

      const result = getLegalEntityBosInTrust(appData, test_trust_id);
      expect(result.length).toEqual(3);
      expect(result).toEqual([{}, {}, {}]);
    });

    test("test getLegalEntityBosInTrust with application data and no trust id", () => {
      const empty_test_trust_id = '';
      const appData = {
        [TrustKey]: [{
          'CORPORATES': [{}, {}, {}] as TrustCorporate[],
        }, {
          'CORPORATES': [{}, {}, {}] as TrustCorporate[],
        }]
      } as ApplicationData;

      const result = getLegalEntityBosInTrust(appData, empty_test_trust_id);
      expect(result).toEqual([]);
    });

    test("test getLegalEntityTrustee from trust successfully", () => {
      const test_trust_id = '342';
      const legalEntityTrustee1 = { id: "999" } as TrustCorporate;
      const legalEntityTrustee2 = { id: "901" } as TrustCorporate;
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'CORPORATES': [ legalEntityTrustee1, legalEntityTrustee2 ] as TrustCorporate[],
        }]
      } as ApplicationData;

      const result = getLegalEntityTrustee(appData, test_trust_id, "999");
      expect(result).toEqual(legalEntityTrustee1);
    });

    test("test getLegalEntityTrustee from trust with application data with no trusteeId", () => {
      const test_trust_id = '342';
      const empty_trustee_id = '';
      const legalEntityTrustee1 = { id: "999" } as TrustCorporate;
      const legalEntityTrustee2 = { id: "901" } as TrustCorporate;
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'CORPORATES': [ legalEntityTrustee1, legalEntityTrustee2 ] as TrustCorporate[],
        }]
      } as ApplicationData;

      const result = getLegalEntityTrustee(appData, test_trust_id, empty_trustee_id);
      expect(result).toEqual({});
    });

    test("test getLegalEntityTrustee from trust with application data and CORPORATES array is empty", () => {
      const test_trust_id = '342';
      const appData = {
        [TrustKey]: [{
          'trust_id': test_trust_id,
          'CORPORATES': [] as TrustCorporate[],
        }]
      } as ApplicationData;

      const result = getLegalEntityTrustee(appData, test_trust_id, "999");
      expect(result).toEqual({});
    });

  });

  describe('test if overseas entity requires trust data', () => {

    test("test checkEntityRequiresTrusts with application data and trustee nature of control", () => {

      const result = checkEntityRequiresTrusts(mockAppData);
      expect(result).toEqual(true);
    });

    test("test checkEntityRequiresTrusts with application data and no trustee nature of control", () => {

      const appData = {
        [TrustKey]: [
          mockTrust1Data,
          mockTrust2Data,
        ],
        [BeneficialOwnerIndividualKey]: [
          {} as BeneficialOwnerIndividual,
          mockBoIndividual2,
        ],
        [BeneficialOwnerOtherKey]: [
          {} as BeneficialOwnerOther,
          mockBoOle1,
        ],
      } as ApplicationData;

      const result = checkEntityRequiresTrusts(appData);
      expect(result).toEqual(false);
    });

    test("test checkEntityRequiresTrusts with no application data", () => {

      let appData;

      const result = checkEntityRequiresTrusts(appData);
      expect(result).toEqual(false);
    });
  });

  describe('test if overseas entity contains any trust data', () => {

    test("test getBeneficialOwnerList with application data and trustee nature of control", () => {

      const result = getTrustLandingUrl(mockAppData);
      expect(result).toEqual(`${TRUST_ENTRY_URL + ADD_TRUST_URL}`);
    });

    test("test getTrustLandingUrl with bo having trust data", () => {

      const result = getTrustLandingUrl(mockAppData);
      expect(result).toEqual(`${TRUST_ENTRY_URL + ADD_TRUST_URL}`);
    });

    test("test getTrustLandingUrl with bo having trust nature of control but no trust data", () => {

      const mockBoIndividualNoTrustData = {
        id: '9001',
        trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
      } as BeneficialOwnerIndividual;

      const mockBoOleNoTrustData = {
        id: '8002',
        trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
      } as BeneficialOwnerOther;

      const appData = {
        [BeneficialOwnerIndividualKey]: [
          {} as BeneficialOwnerIndividual,
          mockBoIndividualNoTrustData,
        ],
        [BeneficialOwnerOtherKey]: [
          {} as BeneficialOwnerOther,
          mockBoOleNoTrustData,
        ],
      } as ApplicationData;

      const result = getTrustLandingUrl(appData);
      expect(result).toEqual(`${TRUST_DETAILS_URL}${TRUST_INTERRUPT_URL}`);
    });

  });

  describe('test if overseas entity contains any trust data with params for redis removal', () => {

    test("test getBeneficialOwnerList with application data and trustee nature of control", () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);

      const result = getTrustLandingUrl(mockAppData, mockRequest);
      expect(mockGetUrlWithParamsToPath).toBeCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(`${TRUST_ENTRY_WITH_PARAMS_URL}${ADD_TRUST_URL}`);
      expect(result).toEqual(MOCKED_URL);
    });

    test("test getTrustLandingUrl with bo having trust data", () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);

      const result = getTrustLandingUrl(mockAppData, mockRequest);
      expect(mockGetUrlWithParamsToPath).toBeCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(`${TRUST_ENTRY_WITH_PARAMS_URL}${ADD_TRUST_URL}`);
      expect(result).toEqual(MOCKED_URL);
    });

    test("test getTrustLandingUrl with bo having trust nature of control but no trust data", () => {
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);

      const mockBoIndividualNoTrustData = {
        id: '9001',
        trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
      } as BeneficialOwnerIndividual;

      const mockBoOleNoTrustData = {
        id: '8002',
        trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
      } as BeneficialOwnerOther;

      const appData = {
        [BeneficialOwnerIndividualKey]: [
          {} as BeneficialOwnerIndividual,
          mockBoIndividualNoTrustData,
        ],
        [BeneficialOwnerOtherKey]: [
          {} as BeneficialOwnerOther,
          mockBoOleNoTrustData,
        ],
      } as ApplicationData;

      const result = getTrustLandingUrl(appData, mockRequest);
      expect(mockGetUrlWithParamsToPath).toBeCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(`${TRUST_ENTRY_WITH_PARAMS_URL}${TRUST_INTERRUPT_URL}`);
      expect(result).toEqual(MOCKED_URL);
    });

  });

  describe('test mapping API Trust return model back to Web model', () => {

    const test_trust_id = '342';
    const second_test_trust_id = '546';

    const api_ura_address = {
      property_name_number: "2",
      line_1: "Lime Street",
      line_2: "Beachside",
      locality: "Wick",
      county: "Vale of Glamorgan",
      country: "Wales",
      postcode: "CF71 7QA",
      care_of: "",
      po_box: "",
    };
    const api_service_address = {
      property_name_number: "8",
      line_1: "Station Approach",
      line_2: "",
      locality: "Hereford",
      county: "Herefordshire",
      country: "England",
      postcode: "HR1 1AA",
      care_of: "",
      po_box: "",
    };
    const api_registered_office_address = {
      property_name_number: "1",
      line_1: "Main Street",
      line_2: "Standard Zone",
      locality: "Toytown",
      county: "Big Ears",
      country: "Noddyland",
      postcode: "NOD 1",
      care_of: "",
      po_box: "",
    };
    const api_empty_address = {
      property_name_number: "",
      line_1: "",
      line_2: "",
      locality: "",
      county: "",
      country: "",
      postcode: "",
      care_of: "",
      po_box: "",
    };
    const individualTrustee1 = {
      type: "INTERESTED_PERSON",
      forename: "Fred",
      other_forenames: "",
      surname: "Bloggs",
      dob_day: "01",
      dob_month: "02",
      dob_year: "1990",
      nationality: "Welsh",
      second_nationality: "German",
      usual_residential_address: api_ura_address,
      is_service_address_same_as_usual_residential_address: true,
      service_address: api_empty_address,
      date_became_interested_person_day: "10",
      date_became_interested_person_month: "11",
      date_became_interested_person_year: "2014",
    };
    const individualTrustee2 = {
      type: "GRANTOR",
      forename: "Jane",
      other_forenames: "",
      surname: "Smith",
      dob_day: "02",
      dob_month: "03",
      dob_year: "1994",
      nationality: "English",
      second_nationality: "",
      usual_residential_address: api_ura_address,
      is_service_address_same_as_usual_residential_address: false,
      service_address: api_service_address,
      date_became_interested_person_day: "",
      date_became_interested_person_month: "",
      date_became_interested_person_year: "",
    };
    const corporateTrustee1 = {
      name: "Orange",
      type: "INTERESTED_PERSON",
      registered_office_address: api_registered_office_address,
      is_service_address_same_as_principal_address: true,
      service_address: api_empty_address,
      date_became_interested_person_day: "10",
      date_became_interested_person_month: "11",
      date_became_interested_person_year: "2014",
      identification_legal_authority: "la 1",
      identification_legal_form: "lf 1",
      identification_place_registered: "pr 1",
      identification_country_registration: "cr 1",
      identification_registration_number: "rn 1",
      is_on_register_in_country_formed_in: true,
    };
    const corporateTrustee2 = {
      name: "Apple",
      type: "GRANTOR",
      registered_office_address: api_registered_office_address,
      is_service_address_same_as_principal_address: false,
      service_address: api_service_address,
      date_became_interested_person_day: "",
      date_became_interested_person_month: "",
      date_became_interested_person_year: "",
      identification_legal_authority: "la 2",
      identification_legal_form: "lf 2",
      identification_place_registered: "",
      identification_country_registration: "",
      identification_registration_number: "",
      is_on_register_in_country_formed_in: false,
    };
    const corporateTrustee3 = {
      name: "Grape",
      type: "BENEFICIARY",
      registered_office_address: api_registered_office_address,
      is_service_address_same_as_principal_address: false,
      service_address: api_service_address,
      date_became_interested_person_day: "",
      date_became_interested_person_month: "",
      date_became_interested_person_year: "",
      identification_legal_authority: "la 2",
      identification_legal_form: "lf 2",
      identification_place_registered: "",
      identification_country_registration: "",
      identification_registration_number: "",
      is_on_register_in_country_formed_in: false,
    };
    const corporateTrustee4 = {
      name: "Kiwi",
      type: "SETTLOR",
      registered_office_address: api_registered_office_address,
      is_service_address_same_as_principal_address: false,
      service_address: api_service_address,
      date_became_interested_person_day: "",
      date_became_interested_person_month: "",
      date_became_interested_person_year: "",
      identification_legal_authority: "la 2",
      identification_legal_form: "lf 2",
      identification_place_registered: "",
      identification_country_registration: "",
      identification_registration_number: "",
      is_on_register_in_country_formed_in: false,
    };
    const historicBoTrusteeIndividual = {
      forename: "Ben",
      other_forenames: "",
      surname: "Gone",
      notified_date_day: "10",
      notified_date_month: "12",
      notified_date_year: "2010",
      ceased_date_day: "01",
      ceased_date_month: "02",
      ceased_date_year: "2022",
      corporate_indicator: false,
    };
    const historicBoTrusteeCorporate = {
      corporate_name: "Yesterday Limited",
      notified_date_day: "10",
      notified_date_month: "12",
      notified_date_year: "2010",
      ceased_date_day: "01",
      ceased_date_month: "02",
      ceased_date_year: "2022",
      corporate_indicator: true,
    };

    const apiData = {
      [TrustKey]: [{
        'trust_id': test_trust_id,
        'CORPORATES': [],
        'INDIVIDUALS': [ individualTrustee1, individualTrustee2 ],
        'HISTORICAL_BO': [],
      }, {
        'trust_id': second_test_trust_id,
        'CORPORATES': [ corporateTrustee1, corporateTrustee2, corporateTrustee3, corporateTrustee4 ],
        'INDIVIDUALS': [],
        'HISTORICAL_BO': [ historicBoTrusteeIndividual, historicBoTrusteeCorporate ],
      }
      ]
    };

    test("test Web Model OK for multi-trust app data with all trusees types", () => {

      const trusts = apiData.trusts ?? [];

      expect(individualTrustee1).not.toHaveProperty('id');
      expect(individualTrustee2).not.toHaveProperty('id');
      expect(corporateTrustee1).not.toHaveProperty('id');
      expect(corporateTrustee2).not.toHaveProperty('id');
      expect(historicBoTrusteeIndividual).not.toHaveProperty('id');
      expect(historicBoTrusteeCorporate).not.toHaveProperty('id');

      mapTrustApiReturnModelToWebModel(apiData as any);

      const trust = trusts[0];
      const individualTrusteesWebModel = trust.INDIVIDUALS ?? [] as TrustIndividual[];
      expect(individualTrusteesWebModel[0]).toHaveProperty('id');
      expect(individualTrusteesWebModel[0]["type"]).toEqual("Interested_Person");
      expect(individualTrusteesWebModel[0]["forename"]).toEqual("Fred");
      expect(individualTrusteesWebModel[0]["other_forenames"]).toEqual("");
      expect(individualTrusteesWebModel[0]["surname"]).toEqual("Bloggs");
      expect(individualTrusteesWebModel[0]["dob_day"]).toEqual("01");
      expect(individualTrusteesWebModel[0]["dob_month"]).toEqual("02");
      expect(individualTrusteesWebModel[0]["dob_year"]).toEqual("1990");
      expect(individualTrusteesWebModel[0]["nationality"]).toEqual("Welsh");
      expect(individualTrusteesWebModel[0]["second_nationality"]).toEqual("German");
      expect(individualTrusteesWebModel[0]["ura_address_premises"]).toEqual("2");
      expect(individualTrusteesWebModel[0]["ura_address_line_1"]).toEqual("Lime Street");
      expect(individualTrusteesWebModel[0]["ura_address_line_2"]).toEqual("Beachside");
      expect(individualTrusteesWebModel[0]["ura_address_locality"]).toEqual("Wick");
      expect(individualTrusteesWebModel[0]["ura_address_region"]).toEqual("Vale of Glamorgan");
      expect(individualTrusteesWebModel[0]["ura_address_country"]).toEqual("Wales");
      expect(individualTrusteesWebModel[0]["ura_address_postal_code"]).toEqual("CF71 7QA");
      expect(individualTrusteesWebModel[0]["ura_address_care_of"]).toEqual("");
      expect(individualTrusteesWebModel[0]["ura_address_po_box"]).toEqual("");
      expect(individualTrusteesWebModel[0]["is_service_address_same_as_usual_residential_address"]).toEqual(true);
      expect(individualTrusteesWebModel[0]["sa_address_premises"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_line_1"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_line_2"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_locality"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_region"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_country"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_postal_code"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_care_of"]).toEqual("");
      expect(individualTrusteesWebModel[0]["sa_address_po_box"]).toEqual("");
      expect(individualTrusteesWebModel[0]["date_became_interested_person_day"]).toEqual("10");
      expect(individualTrusteesWebModel[0]["date_became_interested_person_month"]).toEqual("11");
      expect(individualTrusteesWebModel[0]["date_became_interested_person_year"]).toEqual("2014");

      expect(individualTrusteesWebModel[1]).toHaveProperty('id');
      expect(individualTrusteesWebModel[1]["type"]).toEqual("Grantor");
      expect(individualTrusteesWebModel[1]["forename"]).toEqual("Jane");
      expect(individualTrusteesWebModel[1]["other_forenames"]).toEqual("");
      expect(individualTrusteesWebModel[1]["surname"]).toEqual("Smith");
      expect(individualTrusteesWebModel[1]["dob_day"]).toEqual("02");
      expect(individualTrusteesWebModel[1]["dob_month"]).toEqual("03");
      expect(individualTrusteesWebModel[1]["dob_year"]).toEqual("1994");
      expect(individualTrusteesWebModel[1]["nationality"]).toEqual("English");
      expect(individualTrusteesWebModel[1]["second_nationality"]).toEqual("");
      expect(individualTrusteesWebModel[1]["ura_address_premises"]).toEqual("2");
      expect(individualTrusteesWebModel[1]["ura_address_line_1"]).toEqual("Lime Street");
      expect(individualTrusteesWebModel[1]["ura_address_line_2"]).toEqual("Beachside");
      expect(individualTrusteesWebModel[1]["ura_address_locality"]).toEqual("Wick");
      expect(individualTrusteesWebModel[1]["ura_address_region"]).toEqual("Vale of Glamorgan");
      expect(individualTrusteesWebModel[1]["ura_address_country"]).toEqual("Wales");
      expect(individualTrusteesWebModel[1]["ura_address_postal_code"]).toEqual("CF71 7QA");
      expect(individualTrusteesWebModel[1]["ura_address_care_of"]).toEqual("");
      expect(individualTrusteesWebModel[1]["ura_address_po_box"]).toEqual("");
      expect(individualTrusteesWebModel[1]["is_service_address_same_as_usual_residential_address"]).toEqual(false);
      expect(individualTrusteesWebModel[1]["sa_address_premises"]).toEqual("8");
      expect(individualTrusteesWebModel[1]["sa_address_line_1"]).toEqual("Station Approach");
      expect(individualTrusteesWebModel[1]["sa_address_line_2"]).toEqual("");
      expect(individualTrusteesWebModel[1]["sa_address_locality"]).toEqual("Hereford");
      expect(individualTrusteesWebModel[1]["sa_address_region"]).toEqual("Herefordshire");
      expect(individualTrusteesWebModel[1]["sa_address_country"]).toEqual("England");
      expect(individualTrusteesWebModel[1]["sa_address_postal_code"]).toEqual("HR1 1AA");
      expect(individualTrusteesWebModel[1]["sa_address_care_of"]).toEqual("");
      expect(individualTrusteesWebModel[1]["sa_address_po_box"]).toEqual("");
      expect(individualTrusteesWebModel[1]["date_became_interested_person_day"]).toEqual("");
      expect(individualTrusteesWebModel[1]["date_became_interested_person_month"]).toEqual("");
      expect(individualTrusteesWebModel[1]["date_became_interested_person_year"]).toEqual("");

      const trust2 = trusts[1];

      const corporatelTrusteesWebModel = trust2.CORPORATES ?? [] as TrustCorporate[];
      expect(corporatelTrusteesWebModel[0]).toHaveProperty('id');
      expect(corporatelTrusteesWebModel[0]["type"]).toEqual("Interested_Person");
      expect(corporatelTrusteesWebModel[0]["name"]).toEqual("Orange");
      expect(corporatelTrusteesWebModel[0]["ro_address_premises"]).toEqual("1");
      expect(corporatelTrusteesWebModel[0]["ro_address_line_1"]).toEqual("Main Street");
      expect(corporatelTrusteesWebModel[0]["ro_address_line_2"]).toEqual("Standard Zone");
      expect(corporatelTrusteesWebModel[0]["ro_address_locality"]).toEqual("Toytown");
      expect(corporatelTrusteesWebModel[0]["ro_address_region"]).toEqual("Big Ears");
      expect(corporatelTrusteesWebModel[0]["ro_address_country"]).toEqual("Noddyland");
      expect(corporatelTrusteesWebModel[0]["ro_address_postal_code"]).toEqual("NOD 1");
      expect(corporatelTrusteesWebModel[0]["ro_address_care_of"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["ro_address_po_box"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["is_service_address_same_as_principal_address"]).toEqual(true);
      expect(corporatelTrusteesWebModel[0]["sa_address_premises"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_line_1"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_line_2"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_locality"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_region"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_country"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_postal_code"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_care_of"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["sa_address_po_box"]).toEqual("");
      expect(corporatelTrusteesWebModel[0]["date_became_interested_person_day"]).toEqual("10");
      expect(corporatelTrusteesWebModel[0]["date_became_interested_person_month"]).toEqual("11");
      expect(corporatelTrusteesWebModel[0]["date_became_interested_person_year"]).toEqual("2014");
      expect(corporatelTrusteesWebModel[0]["identification_legal_authority"]).toEqual("la 1");
      expect(corporatelTrusteesWebModel[0]["identification_legal_form"]).toEqual("lf 1");
      expect(corporatelTrusteesWebModel[0]["identification_place_registered"]).toEqual("pr 1");
      expect(corporatelTrusteesWebModel[0]["identification_country_registration"]).toEqual("cr 1");
      expect(corporatelTrusteesWebModel[0]["identification_registration_number"]).toEqual("rn 1");
      expect(corporatelTrusteesWebModel[0]["is_on_register_in_country_formed_in"]).toEqual(true);

      expect(corporatelTrusteesWebModel[1]).toHaveProperty('id');
      expect(corporatelTrusteesWebModel[1]["type"]).toEqual("Grantor");
      expect(corporatelTrusteesWebModel[1]["name"]).toEqual("Apple");
      expect(corporatelTrusteesWebModel[1]["ro_address_premises"]).toEqual("1");
      expect(corporatelTrusteesWebModel[1]["ro_address_line_1"]).toEqual("Main Street");
      expect(corporatelTrusteesWebModel[1]["ro_address_line_2"]).toEqual("Standard Zone");
      expect(corporatelTrusteesWebModel[1]["ro_address_locality"]).toEqual("Toytown");
      expect(corporatelTrusteesWebModel[1]["ro_address_region"]).toEqual("Big Ears");
      expect(corporatelTrusteesWebModel[1]["ro_address_country"]).toEqual("Noddyland");
      expect(corporatelTrusteesWebModel[1]["ro_address_postal_code"]).toEqual("NOD 1");
      expect(corporatelTrusteesWebModel[1]["ro_address_care_of"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["ro_address_po_box"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["is_service_address_same_as_principal_address"]).toEqual(false);
      expect(corporatelTrusteesWebModel[1]["sa_address_premises"]).toEqual("8");
      expect(corporatelTrusteesWebModel[1]["sa_address_line_1"]).toEqual("Station Approach");
      expect(corporatelTrusteesWebModel[1]["sa_address_line_2"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["sa_address_locality"]).toEqual("Hereford");
      expect(corporatelTrusteesWebModel[1]["sa_address_region"]).toEqual("Herefordshire");
      expect(corporatelTrusteesWebModel[1]["sa_address_country"]).toEqual("England");
      expect(corporatelTrusteesWebModel[1]["sa_address_postal_code"]).toEqual("HR1 1AA");
      expect(corporatelTrusteesWebModel[1]["date_became_interested_person_day"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["date_became_interested_person_month"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["date_became_interested_person_year"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["identification_legal_authority"]).toEqual("la 2");
      expect(corporatelTrusteesWebModel[1]["identification_legal_form"]).toEqual("lf 2");
      expect(corporatelTrusteesWebModel[1]["identification_place_registered"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["identification_country_registration"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["identification_registration_number"]).toEqual("");
      expect(corporatelTrusteesWebModel[1]["is_on_register_in_country_formed_in"]).toEqual(false);

      expect(corporatelTrusteesWebModel[2]["type"]).toEqual("Beneficiary");
      expect(corporatelTrusteesWebModel[3]["type"]).toEqual("Settlor");

      const historicalTrusteesWebModel = trust2.HISTORICAL_BO ?? [] as TrustHistoricalBeneficialOwner[];
      expect(historicalTrusteesWebModel[0]).toHaveProperty('id');
      expect(historicalTrusteesWebModel[0]["forename"]).toEqual("Ben");
      expect(historicalTrusteesWebModel[0]["other_forenames"]).toEqual("");
      expect(historicalTrusteesWebModel[0]["surname"]).toEqual("Gone");
      expect(historicalTrusteesWebModel[0]["corporate_indicator"]).toEqual(0);
      expect(historicalTrusteesWebModel[0]["notified_date_day"]).toEqual("10");
      expect(historicalTrusteesWebModel[0]["notified_date_month"]).toEqual("12");
      expect(historicalTrusteesWebModel[0]["notified_date_year"]).toEqual("2010");
      expect(historicalTrusteesWebModel[0]["ceased_date_day"]).toEqual("01");
      expect(historicalTrusteesWebModel[0]["ceased_date_month"]).toEqual("02");
      expect(historicalTrusteesWebModel[0]["ceased_date_year"]).toEqual("2022");

      expect(historicalTrusteesWebModel[1]).toHaveProperty('id');
      expect(historicalTrusteesWebModel[1]["corporate_name"]).toEqual("Yesterday Limited");
      expect(historicalTrusteesWebModel[1]["corporate_indicator"]).toEqual(1);
      expect(historicalTrusteesWebModel[1]["notified_date_day"]).toEqual("10");
      expect(historicalTrusteesWebModel[1]["notified_date_month"]).toEqual("12");
      expect(historicalTrusteesWebModel[1]["notified_date_year"]).toEqual("2010");
      expect(historicalTrusteesWebModel[1]["ceased_date_day"]).toEqual("01");
      expect(historicalTrusteesWebModel[1]["ceased_date_month"]).toEqual("02");
      expect(historicalTrusteesWebModel[1]["ceased_date_year"]).toEqual("2022");
    });

  });
  test("no trust data so nothing happens in mapTrustApiReturnModelToWebModel", () => {
    mapTrustApiReturnModelToWebModel({});
  });

  describe('test checking for natures of control that imply trusts', () => {

    test('when no BOs have trustee of a trust noc returns false', () => {
      const appData = {
      };

      const result = checkEntityRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(false);
    });

    test('when no app data returns false', () => {
      const appData = undefined;

      const result = checkEntityRequiresTrusts(appData);
      expect(result).toBe(false);
    });

    test('when corporate BOs have trustee of a trust noc returns true', () => {
      const appData = {
        beneficial_owners_corporate: [{ trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES] }]
      };

      const result = checkEntityRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(true);
    });

    test('when individual BOs have trustee of a trust noc returns true', () => {
      const appData = {
        beneficial_owners_individual: [{ trustees_nature_of_control_types: [NatureOfControlType.APPOINT_OR_REMOVE_MAJORITY_BOARD_DIRECTORS, NatureOfControlType.OVER_25_PERCENT_OF_VOTING_RIGHTS] }]
      };

      const result = checkEntityRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(true);
    });

    test('when no BOs to review have trustee of a trust noc returns false', () => {
      const appData = {
        update: {
        }
      };

      const result = checkEntityReviewRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(false);
    });

    test('when no BOs to review as no update in app data returns false', () => {
      const appData = {
      };

      const result = checkEntityReviewRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(false);
    });

    test('when no BOs to review as no app data returns false', () => {
      const appData = undefined;

      const result = checkEntityReviewRequiresTrusts(appData);
      expect(result).toBe(false);
    });

    test('when corporate BOs to review have trustee of a trust noc returns true', () => {
      const appData = {
        update: {
          review_beneficial_owners_corporate: [{ trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES, NatureOfControlType.SIGNIFICANT_INFLUENCE_OR_CONTROL] }]
        }
      };

      const result = checkEntityReviewRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(true);
    });

    test('when individual BOs to review have trustee of a trust noc returns true', () => {
      const appData = {
        update: {
          review_beneficial_owners_individual: [{ trustees_nature_of_control_types: [NatureOfControlType.OVER_25_PERCENT_OF_SHARES] }]
        }
      };

      const result = checkEntityReviewRequiresTrusts(appData as ApplicationData);
      expect(result).toBe(true);
    });
  });
});
