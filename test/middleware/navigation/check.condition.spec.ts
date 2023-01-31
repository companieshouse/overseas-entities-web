import { describe, expect, test } from '@jest/globals';
import {
  checkBOsOrMOsDetailsEntered,
  checkBeneficialOwnersStatementDetailsEntered,
  checkEntityDetailsEntered,
  checkPresenterDetailsEntered,
  checkHasSoldLandDetailsEntered,
  checkIsSecureRegisterDetailsEntered,
  checkDueDiligenceDetailsEntered,
  checkOverseasNameDetailsEntered,
  checkOverseasEntityNumberEntered
} from "../../../src/middleware/navigation/check.condition";
import { BeneficialOwnerGovKey } from '../../../src/model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividualKey } from '../../../src/model/beneficial.owner.individual.model';
import { BeneficialOwnerOtherKey } from '../../../src/model/beneficial.owner.other.model';
import { BeneficialOwnerStatementKey } from '../../../src/model/beneficial.owner.statement.model';
import { EntityNameKey, OeNumberKey, HasSoldLandKey, IsSecureRegisterKey } from '../../../src/model/data.types.model';
import { DueDiligenceKey } from '../../../src/model/due.diligence.model';
import { EntityKey } from '../../../src/model/entity.model';
import { ManagingOfficerCorporateKey } from '../../../src/model/managing.officer.corporate.model';
import { ManagingOfficerKey } from '../../../src/model/managing.officer.model';
import { OverseasEntityDueDiligenceKey } from '../../../src/model/overseas.entity.due.diligence.model';
import { PresenterKey } from '../../../src/model/presenter.model';
import { DUE_DILIGENCE_OBJECT_MOCK } from '../../__mocks__/due.diligence.mock';
import { OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK } from '../../__mocks__/overseas.entity.due.diligence.mock';
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

  test("checkOverseasNameDetailsEntered should return false", () => {
    const data = checkOverseasNameDetailsEntered({ ...APPLICATION_DATA_MOCK, [EntityNameKey]: undefined });
    expect(data).toEqual(false);
  });

  test("checkPresenterDetailsEntered should return false", () => {
    const data = checkPresenterDetailsEntered({ ...APPLICATION_DATA_MOCK, [PresenterKey]: undefined });
    expect(data).toEqual(false);
  });

  test("checkDueDiligenceDetailsEntered should return false if due diligence object undefined", () => {
    const data = checkDueDiligenceDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [OverseasEntityDueDiligenceKey]: undefined,
      [DueDiligenceKey]: undefined
    });
    expect(data).toEqual(false);
  });

  test("checkDueDiligenceDetailsEntered should return false if due diligence object empty", () => {
    const data = checkDueDiligenceDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [OverseasEntityDueDiligenceKey]: {},
      [DueDiligenceKey]: {}
    });
    expect(data).toEqual(false);
  });

  test("checkDueDiligenceDetailsEntered should return true if DueDiligence object is not blank", () => {
    const data = checkDueDiligenceDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [OverseasEntityDueDiligenceKey]: {},
      [DueDiligenceKey]: DUE_DILIGENCE_OBJECT_MOCK
    });
    expect(data).toEqual(true);
  });

  test("checkDueDiligenceDetailsEntered should return true if OE DueDiligence object is not blank", () => {
    const data = checkDueDiligenceDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [OverseasEntityDueDiligenceKey]: OVERSEAS_ENTITY_DUE_DILIGENCE_OBJECT_MOCK,
      [DueDiligenceKey]: undefined
    });
    expect(data).toEqual(true);
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

  test("checkBOsOrMOsDetailsEntered should return false if BOs and MOs objects are undefined", () => {
    const data = checkBOsOrMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerOtherKey]: undefined,
      [BeneficialOwnerGovKey]: undefined,
      [ManagingOfficerKey]: undefined,
      [ManagingOfficerCorporateKey]: undefined
    });
    expect(data).toEqual(false);
  });

  test("checkBOsOrMOsDetailsEntered should return false if no BOs or MOs", () => {
    const data = checkBOsOrMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: [],
      [BeneficialOwnerOtherKey]: [],
      [BeneficialOwnerGovKey]: [],
      [ManagingOfficerKey]: [],
      [ManagingOfficerCorporateKey]: []
    });
    expect(data).toEqual(false);
  });

  test("checkBOsOrMOsDetailsEntered should return true if just one MOs is present", () => {
    const data = checkBOsOrMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerOtherKey]: [],
      [BeneficialOwnerGovKey]: undefined,
      [ManagingOfficerKey]: [],
      [ManagingOfficerCorporateKey]: APPLICATION_DATA_MOCK[ManagingOfficerCorporateKey]
    });
    expect(data).toEqual(true);
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

  test("checkOverseasEntityNumberEntered should return false", () => {
    const data = checkOverseasEntityNumberEntered({ ...APPLICATION_DATA_MOCK, [OeNumberKey]: undefined });
    expect(data).toEqual(false);
  });
});
