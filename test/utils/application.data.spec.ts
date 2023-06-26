import { Request } from "express";
import { beforeEach, describe, expect, test } from '@jest/globals';

import {
  getApplicationData,
  setApplicationData,
  prepareData,
  deleteApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  removeFromApplicationData,
  getFromApplicationData,
  checkBOsDetailsEntered,
  checkMOsDetailsEntered,
  findBoOrMo,
  checkGivenBoOrMoDetailsExist,
  addPrivateOverseasEntityDetailsToAppData,
} from "../../src/utils/application.data";
import {
  APPLICATION_DATA_UPDATE_BO_MOCK,
  BO_IND_ID,
  BO_OTHER_ID,
  BO_GOV_ID,
  SERVICE_ADDRESS_MOCK,
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ENTITY_OBJECT_MOCK,
  getSessionRequestWithExtraData,
  getSessionRequestWithPermission,
  MO_IND_ID,
  MO_CORP_ID,
} from "../__mocks__/session.mock";
import {
  PARAM_BENEFICIAL_OWNER_GOV,
  PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
  PARAM_BENEFICIAL_OWNER_OTHER,
  PARAM_MANAGING_OFFICER_CORPORATE,
  PARAM_MANAGING_OFFICER_INDIVIDUAL
} from "../..//src/config";
import { ADDRESS } from "../__mocks__/fields/address.mock";
import { beneficialOwnerIndividualType, dataType, entityType } from "../../src/model";
import { ServiceAddressKeys } from '../../src/model/address.model';
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from '../../src/model/beneficial.owner.gov.model';
import { BeneficialOwnerIndividualKey } from "../../src/model/beneficial.owner.individual.model";
import { BeneficialOwnerOtherKey } from "../../src/model/beneficial.owner.other.model";
import { ManagingOfficerCorporateKey } from "../../src/model/managing.officer.corporate.model";
import { ManagingOfficerKey } from "../../src/model/managing.officer.model";

let req: Request;

describe("Application data utils", () => {

  beforeEach(() => {
    req = { headers: {} } as Request;
  });

  test("getApplicationData should return Extra data store in the session", () => {
    const session = getSessionRequestWithExtraData();
    const data = getApplicationData(session);
    expect(data).toEqual(APPLICATION_DATA_MOCK);
  });

  test("getApplicationData should return empty object if session undefined", () => {
    expect(getApplicationData(undefined)).toEqual({});
  });

  test("setApplicationData should store application data into the session", () => {
    const session = getSessionRequestWithExtraData();
    setApplicationData(session, ENTITY_OBJECT_MOCK, entityType.EntityKey);

    const data = getApplicationData(session);
    expect(data).toEqual( { ...APPLICATION_DATA_MOCK, [entityType.EntityKey]: { ...ENTITY_OBJECT_MOCK } });
  });

  test("setApplicationData should store application data into the session for an empty array type object (BOs)", () => {
    const session = getSessionRequestWithPermission();
    setApplicationData(
      session,
      BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      beneficialOwnerIndividualType.BeneficialOwnerIndividualKey
    );

    expect(getApplicationData(session)).toEqual({
      [beneficialOwnerIndividualType.BeneficialOwnerIndividualKey]: [
        BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
      ],
    });
  });

  test("setApplicationData should return undefined if session is not defined", () => {
    // Session at this level can not be undefined, avoid checking req.session type, so
    // we return void if everything is ok, otherwise undefined, where void is not an alias for undefined.
    expect(setApplicationData(undefined, ENTITY_OBJECT_MOCK, entityType.EntityKey)).toEqual(undefined);
  });

  test("prepareData should store application data into the session", () => {
    const data = prepareData(ENTITY_OBJECT_MOCK, ['legal_form', 'email']);
    const { legal_form, email } = ENTITY_OBJECT_MOCK;
    expect(data).toEqual( { legal_form, email } );
  });

  test("deleteApplicationData should return undefined if session is undefined", () => {
    const data = deleteApplicationData(undefined);
    expect(data).toEqual(undefined);
  });

  test("deleteApplicationData should delete stored application data from the session", () => {
    const sessionWithExtraData = getSessionRequestWithExtraData();
    const sessionWithOutExtraData = getSessionRequestWithPermission();
    const response = deleteApplicationData(sessionWithExtraData);

    expect(response).toEqual(true);
    expect(sessionWithExtraData).toEqual( sessionWithOutExtraData );
  });

  test("mapDataObjectToFields should map address to address fields present on the view", () => {
    const response = mapDataObjectToFields(ADDRESS, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual(SERVICE_ADDRESS_MOCK);
  });

  test("mapDataObjectToFields should return empty object when data is blank", () => {
    const response = mapDataObjectToFields(null, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual({});
  });

  test('checkBOsDetailsEntered should be truthy if at least one BOs is present', () => {
    const response = checkBOsDetailsEntered(APPLICATION_DATA_MOCK);
    expect(response).toEqual(true);
  });

  test('checkBOsDetailsEntered should be truthy if BOC is present', () => {
    const response = checkBOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerGovKey]: undefined
    });
    expect(response).toEqual(true);
  });

  test('checkBOsDetailsEntered should be truthy if BOG is present', () => {
    const response = checkBOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerOtherKey]: undefined
    });
    expect(response).toEqual(true);
  });

  test('checkMOsDetailsEntered should be truthy if at least one MOs is present', () => {
    const response = checkMOsDetailsEntered(APPLICATION_DATA_MOCK);
    expect(response).toEqual(true);
  });

  test('checkMOsDetailsEntered should be truthy if MOC is present', () => {
    const response = checkMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [ManagingOfficerKey]: undefined
    });
    expect(response).toEqual(true);
  });

  test('checkBOsDetailsEntered should be falsy if no BOs are present', () => {
    const response = checkBOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [BeneficialOwnerIndividualKey]: undefined,
      [BeneficialOwnerOtherKey]: undefined,
      [BeneficialOwnerGovKey]: undefined
    });
    expect(response).toEqual(false);
  });

  test('checkMOsDetailsEntered should be falsy if no MOs are present', () => {
    const response = checkMOsDetailsEntered({
      ...APPLICATION_DATA_MOCK,
      [ManagingOfficerKey]: undefined,
      [ManagingOfficerCorporateKey]: undefined
    });
    expect(response).toEqual(false);
  });

  test('findBoOrMo should return BO Individual if valid data given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_INDIVIDUAL,
      BO_IND_ID
    );
    expect(beneficialOwner.id).toEqual(BO_IND_ID);
  });

  test('findBoOrMo should return BO Gov if valid data given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_GOV,
      BO_GOV_ID
    );
    expect(beneficialOwner.id).toEqual(BO_GOV_ID);
  });

  test('findBoOrMo should return BO Other if valid data given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_OTHER,
      BO_OTHER_ID
    );
    expect(beneficialOwner.id).toEqual(BO_OTHER_ID);
  });

  test('findBoOrMo should return MO Individual if valid data given', () => {
    const managingOfficer = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_INDIVIDUAL,
      MO_IND_ID
    );
    expect(managingOfficer.id).toEqual(MO_IND_ID);
  });

  test('findBoOrMo should return MO Corporate if valid data given', () => {
    const managingOfficer = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_CORPORATE,
      MO_CORP_ID
    );
    expect(managingOfficer.id).toEqual(MO_CORP_ID);
  });

  test('findBoOrMo should return undefined if invalid id given', () => {
    const beneficialOwner = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_OTHER,
      'fake-id'
    );
    expect(beneficialOwner).toEqual(undefined);
  });

  test('findBoOrMo should return undefined if invalid BO or MO type given', () => {
    const boOrMo = findBoOrMo(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      'not-a-real-bo-type',
      BO_OTHER_ID
    );
    expect(boOrMo).toEqual(undefined);
  });

  test('checkGivenBoOrMoDetailsExist returns true if beneficial owner is found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_GOV,
      BO_GOV_ID
    )).toEqual(true);
  });

  test('checkGivenBoOrMoDetailsExist returns false if beneficial owner not found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_BENEFICIAL_OWNER_GOV,
      'fake-id'
    )).toEqual(false);
  });

  test('checkGivenBoOrMoDetailsExist returns true if managing officer is found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_INDIVIDUAL,
      MO_IND_ID
    )).toEqual(true);
  });

  test('checkGivenBoOrMoDetailsExist returns false if managing officer not found', () => {
    expect(checkGivenBoOrMoDetailsExist(
      APPLICATION_DATA_UPDATE_BO_MOCK,
      PARAM_MANAGING_OFFICER_INDIVIDUAL,
      'fake-id'
    )).toEqual(false);
  });

  test("mapFieldsToDataObject should map address fields coming from the view to address", () => {
    const response = mapFieldsToDataObject(SERVICE_ADDRESS_MOCK, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual(ADDRESS);
  });

  test("mapFieldsToDataObject should return empty object when data is blank", () => {
    const response = mapFieldsToDataObject(null, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual({});
  });

  test("removeFromApplicationData should remove specified object from data", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    let data = getApplicationData(session);
    const boGov = data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID);
    expect(boGov).not.toBeUndefined();

    removeFromApplicationData(req, BeneficialOwnerGovKey, BO_GOV_ID);

    data = getApplicationData(session);
    expect(data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID)).toBeUndefined();

    // restore the boGov object so other tests don't fail as data does not get reset
    if (boGov) {
      data[BeneficialOwnerGovKey]?.push(boGov);
    }
    expect(data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID)).not.toBeUndefined();
  });

  test("removeFromApplicationData should throw error when id not found", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    expect(() => removeFromApplicationData(req, BeneficialOwnerGovKey, "no id")).toThrow(`${BeneficialOwnerGovKey}`);
  });

  test("getFromApplicationData should return specified object from data", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    const boGov: BeneficialOwnerGov = getFromApplicationData(req, BeneficialOwnerGovKey, BO_GOV_ID);

    expect(boGov).not.toBeUndefined();
    expect(boGov.id).toEqual(BO_GOV_ID);
  });

  test("getFromApplicationData should throw error when id not found", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    expect(() => getFromApplicationData(req, BeneficialOwnerGovKey, "no id")).toThrow(`${BeneficialOwnerGovKey}`);
  });

  test("getFromApplicationData should throw error when id undefined", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    expect(() => getFromApplicationData(req, BeneficialOwnerGovKey, undefined as unknown as string)).toThrow(`${BeneficialOwnerGovKey}`);
  });

  test("getFromApplicationData should return undefined if error boolean false and id not found", () => {
    const session = getSessionRequestWithExtraData();
    req.session = session;
    const bo: BeneficialOwnerGov = getFromApplicationData(req, BeneficialOwnerGovKey, "no id", false);
    expect(bo).toBeUndefined;
  });

  test("getFromApplicationData should return undefined if error boolean false and id undefined", () => {
    const session = getSessionRequestWithPermission();
    req.session = session;
    const bo: BeneficialOwnerGov = getFromApplicationData(req, BeneficialOwnerGovKey, undefined as unknown as string, false);
    expect(bo).toBeUndefined;
  });

  test('addPrivateOverseasEntityDetailsToAppData should store the private details into the session', () => {
    const appData = { entity: {} };
    const session = getSessionRequestWithExtraData(appData);

    addPrivateOverseasEntityDetailsToAppData(session, appData, { email_address: 'private@overseasentities.test' });

    const resultAppData = getApplicationData(session);
    expect(resultAppData.entity?.email).toBe('private@overseasentities.test');
  });

  test('addPrivateOverseasEntityDetailsToAppData should leave appData unchanged if no entity present in appData', () => {
    const appData = { entity_number: 'OE123444' };
    const session = getSessionRequestWithExtraData(appData);

    addPrivateOverseasEntityDetailsToAppData(session, appData, { email_address: 'private@overseasentities.test' });

    const resultAppData = getApplicationData(session);
    expect(resultAppData).toEqual(appData);
  });
});
