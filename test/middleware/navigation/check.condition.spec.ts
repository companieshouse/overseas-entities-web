import { describe, expect, test } from '@jest/globals';
import {
  checkHasNotBOsOrMOs,
  checkHasNotBeneficialOwnersStatement,
  checkHasNotEntity,
  checkHasNotPresenter,
  checkHasSoldLand,
  checkIsSecureRegister
} from "../../../src/middleware/navigation/check.condition";
import { BeneficialOwnerGovKey } from '../../../src/model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividualKey } from '../../../src/model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../../src/model/beneficial.owner.other.model';
import { BeneficialOwnerStatementKey } from '../../../src/model/beneficial.owner.statement.model';
import { HasSoldLandKey, IsSecureRegisterKey } from '../../../src/model/data.types.model';
import { EntityKey } from '../../../src/model/entity.model';
import { ManagingOfficerCorporateKey } from '../../../src/model/managing.officer.corporate.model';
import { ManagingOfficerKey } from '../../../src/model/managing.officer.model';
import { PresenterKey } from '../../../src/model/presenter.model';
import { APPLICATION_DATA_MOCK } from '../../__mocks__/session.mock';

describe("check condition navigation tests", () => {

  test("checkHasSoldLand should return true", () => {
    const data = checkHasSoldLand({ ...APPLICATION_DATA_MOCK, [HasSoldLandKey]: '1' });
    expect(data).toEqual(true);
  });

  test("checkIsSecureRegister should return true", () => {
    const data = checkIsSecureRegister({ ...APPLICATION_DATA_MOCK, [IsSecureRegisterKey]: '1' });
    expect(data).toEqual(true);
  });

  test("checkHasNotPresenter should return true", () => {
    const data = checkHasNotPresenter({ ...APPLICATION_DATA_MOCK, [PresenterKey]: undefined });
    expect(data).toEqual(true);
  });

  test("checkHasNotEntity should return true", () => {
    const data = checkHasNotEntity({ ...APPLICATION_DATA_MOCK, [EntityKey]: undefined });
    expect(data).toEqual(true);
  });

  test("checkHasNotBeneficialOwnersStatement should return true", () => {
    const data = checkHasNotBeneficialOwnersStatement({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerStatementKey]: undefined });
    expect(data).toEqual(true);
  });

  test("checkHasNotBOsOrMOs should return true, object empty", () => {
    const data = checkHasNotBOsOrMOs({});
    expect(data).toEqual(true);
  });

  test(`checkHasNotBOsOrMOs should return false even with ${BeneficialOwnerIndividualKey} object missing`, () => {
    const data = checkHasNotBOsOrMOs({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerIndividualKey]: undefined });
    expect(data).toEqual(false);
  });

  test(`checkHasNotBOsOrMOs should return false even with ${BeneficialOwnerOtherKey} object missing`, () => {
    const data = checkHasNotBOsOrMOs({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerOtherKey]: undefined });
    expect(data).toEqual(false);
  });

  test(`checkHasNotBOsOrMOs should return false even with ${BeneficialOwnerGovKey} object missing`, () => {
    const data = checkHasNotBOsOrMOs({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerGovKey]: undefined });
    expect(data).toEqual(false);
  });

  test(`checkHasNotBOsOrMOs should return false even with ${ManagingOfficerKey} object missing`, () => {
    const data = checkHasNotBOsOrMOs({ ...APPLICATION_DATA_MOCK, [ManagingOfficerKey]: undefined });
    expect(data).toEqual(false);
  });

  test(`checkHasNotBOsOrMOs should return false even with ${ManagingOfficerCorporateKey} object missing`, () => {
    const data = checkHasNotBOsOrMOs({ ...APPLICATION_DATA_MOCK, [ManagingOfficerCorporateKey]: undefined });
    expect(data).toEqual(false);
  });

  test("checkHasNotBOsOrMOs should return false, all good", () => {
    const data = checkHasNotBOsOrMOs(APPLICATION_DATA_MOCK);
    expect(data).toEqual(false);
  });
});
