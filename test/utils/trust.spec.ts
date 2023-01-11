import { describe, expect, test } from '@jest/globals';
import {
  addTrustToBeneficialOwner,
  getBoIndividualAssignableToTrust,
  getBoOtherAssignableToTrust,
} from '../../src/utils/trusts';
import { NatureOfControlType } from '../../src/model/data.types.model';
import { TrustBeneficialOwner } from '../../src/model/trust.model';
import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKey,
} from '../../src/model/beneficial.owner.individual.model';
import { BeneficialOwnerOther, BeneficialOwnerOtherKey } from '../../src/model/beneficial.owner.other.model';

describe('Trust Utils method tests', () => {
  const newTrustId = 'dummyTrustId';

  const mockBoIndividual1 = {
    id: '9001',
    trustees_nature_of_control_types: ['dummyType' as NatureOfControlType],
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
  } as BeneficialOwnerOther;

  const mockAppData = {
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
  };

  test('test get Bo Individuals assignable to Trust', () => {
    expect(getBoIndividualAssignableToTrust(mockAppData)).toEqual([mockBoIndividual1]);
  });

  test('test get Bo other legal assignable to Trust', () => {
    expect(getBoOtherAssignableToTrust(mockAppData)).toEqual([mockBoOle2]);
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
});
