import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mapBoIndividualToPage, mapBoOtherToPage } from "../../../src/utils/trust/beneficial.owner.mapper";
import { BeneficialOwnerIndividual } from '../../../src/model/beneficial.owner.individual.model';
import { BeneficialOwnerOther } from '../../../src/model/beneficial.owner.other.model';
import { BeneficialOwnerTypeChoice } from "../../../src/model/beneficial.owner.type.model";

describe('Trust Details page Mapper Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('To Page mapper methods tests', () => {
    test('mapBoIndividualToPage should return object', () => {
      const mockBo = {
        id: '9999',
        first_name: 'dummyFirst',
        last_name: 'dummy Last',
      } as BeneficialOwnerIndividual;

      expect(mapBoIndividualToPage(mockBo)).toEqual({
        id: mockBo.id,
        name: `${mockBo.first_name} ${mockBo.last_name}`,
        type: BeneficialOwnerTypeChoice.individual,
      });
    });

    test('mapBoOtherToPage should return object', () => {
      const mockBo = {
        id: '9999',
        name: 'dummyName',
      } as BeneficialOwnerOther;

      expect(mapBoOtherToPage(mockBo)).toEqual({
        id: mockBo.id,
        name: mockBo.name,
        type: BeneficialOwnerTypeChoice.otherLegal,
        is_newly_added: true,
      });
    });
  });
});
