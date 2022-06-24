import { describe, expect, test } from '@jest/globals';
import {
  checkHasBOsOrMOs,
  checkHasBeneficialOwnersStatement,
  checkHasEntity,
  checkHasPresenter,
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

  test("checkHasPresenter should return true", () => {
    const data = checkHasPresenter({ ...APPLICATION_DATA_MOCK, [PresenterKey]: null });
    expect(data).toEqual(true);
  });

  test("checkHasEntity should return true", () => {
    const data = checkHasEntity({ ...APPLICATION_DATA_MOCK, [EntityKey]: null });
    expect(data).toEqual(true);
  });

  test("checkHasBeneficialOwnersStatement should return true", () => {
    const data = checkHasBeneficialOwnersStatement({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerStatementKey]: null });
    expect(data).toEqual(true);
  });

  test("checkHasBOsOrMOs should return true, object empty", () => {
    const data = checkHasBOsOrMOs({});
    expect(data).toEqual(true);
  });

  test(`checkHasBOsOrMOs should return false even with ${BeneficialOwnerIndividualKey} object missing`, () => {
    const data = checkHasBOsOrMOs({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerIndividualKey]: null });
    expect(data).toEqual(false);
  });

  test(`checkHasBOsOrMOs should return false even with ${BeneficialOwnerOtherKey} object missing`, () => {
    const data = checkHasBOsOrMOs({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerOtherKey]: null });
    expect(data).toEqual(false);
  });

  test(`checkHasBOsOrMOs should return false even with ${BeneficialOwnerGovKey} object missing`, () => {
    const data = checkHasBOsOrMOs({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerGovKey]: null });
    expect(data).toEqual(false);
  });

  test(`checkHasBOsOrMOs should return false even with ${ManagingOfficerKey} object missing`, () => {
    const data = checkHasBOsOrMOs({ ...APPLICATION_DATA_MOCK, [ManagingOfficerKey]: null });
    expect(data).toEqual(false);
  });

  test(`checkHasBOsOrMOs should return false even with ${ManagingOfficerCorporateKey} object missing`, () => {
    const data = checkHasBOsOrMOs({ ...APPLICATION_DATA_MOCK, [ManagingOfficerCorporateKey]: null });
    expect(data).toEqual(false);
  });

  test("checkHasBOsOrMOs should return false, all good", () => {
    const data = checkHasBOsOrMOs(APPLICATION_DATA_MOCK);
    expect(data).toEqual(false);
  });
});
