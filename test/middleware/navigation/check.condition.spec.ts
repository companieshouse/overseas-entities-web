import { describe, expect, test } from '@jest/globals';
import {
  checkBOsOrMOsDetailsEntered,
  checkBeneficialOwnersStatementDetailsEntered,
  checkEntityDetailsEntered,
  checkPresenterDetailsEntered,
  checkHasSoldLandDetailsEntered,
  checkIsSecureRegisterDetailsEntered
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

  test("checkHasSoldLandDetailsEntered should return false", () => {
    const data = checkHasSoldLandDetailsEntered({ ...APPLICATION_DATA_MOCK, [HasSoldLandKey]: '1' });
    expect(data).toEqual(false);
  });

  test("checkIsSecureRegisterDetailsEntered should return false", () => {
    const data = checkIsSecureRegisterDetailsEntered({ ...APPLICATION_DATA_MOCK, [IsSecureRegisterKey]: '1' });
    expect(data).toEqual(false);
  });

  test("checkPresenterDetailsEntered should return false", () => {
    const data = checkPresenterDetailsEntered({ ...APPLICATION_DATA_MOCK, [PresenterKey]: undefined });
    expect(data).toEqual(false);
  });

  test("checkEntityDetailsEntered should return false", () => {
    const data = checkEntityDetailsEntered({ ...APPLICATION_DATA_MOCK, [EntityKey]: undefined });
    expect(data).toEqual(false);
  });

  test("checkBeneficialOwnersStatementDetailsEntered should return false", () => {
    const data = checkBeneficialOwnersStatementDetailsEntered({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerStatementKey]: undefined });
    expect(data).toEqual(false);
  });

  test("checkBOsOrMOsDetailsEntered should return false, object empty", () => {
    const data = checkBOsOrMOsDetailsEntered({});
    expect(data).toEqual(false);
  });

  test(`checkBOsOrMOsDetailsEntered should return true even with ${BeneficialOwnerIndividualKey} object missing`, () => {
    const data = checkBOsOrMOsDetailsEntered({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerIndividualKey]: undefined });
    expect(data).toEqual(true);
  });

  test(`checkBOsOrMOsDetailsEntered should return true even with ${BeneficialOwnerOtherKey} object missing`, () => {
    const data = checkBOsOrMOsDetailsEntered({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerOtherKey]: undefined });
    expect(data).toEqual(true);
  });

  test(`checkBOsOrMOsDetailsEntered should return true even with ${BeneficialOwnerGovKey} object missing`, () => {
    const data = checkBOsOrMOsDetailsEntered({ ...APPLICATION_DATA_MOCK, [BeneficialOwnerGovKey]: undefined });
    expect(data).toEqual(true);
  });

  test(`checkBOsOrMOsDetailsEntered should return true even with ${ManagingOfficerKey} object missing`, () => {
    const data = checkBOsOrMOsDetailsEntered({ ...APPLICATION_DATA_MOCK, [ManagingOfficerKey]: undefined });
    expect(data).toEqual(true);
  });

  test(`checkBOsOrMOsDetailsEntered should return true even with ${ManagingOfficerCorporateKey} object missing`, () => {
    const data = checkBOsOrMOsDetailsEntered({ ...APPLICATION_DATA_MOCK, [ManagingOfficerCorporateKey]: undefined });
    expect(data).toEqual(true);
  });

  test("checkBOsOrMOsDetailsEntered should return true, all good", () => {
    const data = checkBOsOrMOsDetailsEntered(APPLICATION_DATA_MOCK);
    expect(data).toEqual(true);
  });
});
