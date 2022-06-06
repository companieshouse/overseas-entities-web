import { describe, expect, test } from '@jest/globals';
import {
  getApplicationData,
  setApplicationData,
  prepareData,
  deleteApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  removeFromApplicationData,
  getFromApplicationData
} from "../../src/utils/application.data";
import {
  ADDRESS,
  BO_GOV_ID,
  SERVICE_ADDRESS_MOCK,
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ENTITY_OBJECT_MOCK,
  getSessionRequestWithExtraData,
  getSessionRequestWithPermission,
} from "../__mocks__/session.mock";
import { beneficialOwnerIndividualType, dataType, entityType } from "../../src/model";
import { ServiceAddressKeys } from '../../src/model/address.model';
import { BeneficialOwnerGov, BeneficialOwnerGovKey } from '../../src/model/beneficial.owner.gov.model';

describe("Application data utils", () => {

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

  test("mapFieldsToDataObject should map address fields coming from the view to address", () => {
    const response = mapFieldsToDataObject(SERVICE_ADDRESS_MOCK, ServiceAddressKeys, dataType.AddressKeys);
    expect(response).toEqual(ADDRESS);
  });

  test("removeFromApplicationData should remove specified object from data", () => {
    const session = getSessionRequestWithExtraData();
    let data = getApplicationData(session);
    const boGov = data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID);
    expect(boGov).not.toBeUndefined();

    removeFromApplicationData(session, BeneficialOwnerGovKey, BO_GOV_ID);

    data = getApplicationData(session);
    expect(data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID)).toBeUndefined();

    // restore the boGov object so other tests don't fail as data does not get reset
    if (boGov) {
      data[BeneficialOwnerGovKey]?.push(boGov);
    }
    expect(data[BeneficialOwnerGovKey]?.find(boGov => boGov.id === BO_GOV_ID)).not.toBeUndefined();
  });

  test("getFromApplicationData should return specified object from data", () => {
    const session = getSessionRequestWithExtraData();
    const boGov: BeneficialOwnerGov = getFromApplicationData(session, BeneficialOwnerGovKey, BO_GOV_ID);

    expect(boGov).not.toBeUndefined();
    expect(boGov.id).toEqual(BO_GOV_ID);
  });

  test("getFromApplicationData should return empty object from data when id not found", () => {
    const session = getSessionRequestWithExtraData();
    const boGov: BeneficialOwnerGov = getFromApplicationData(session, BeneficialOwnerGovKey, "no id");

    expect(boGov).not.toBeUndefined();
    expect(boGov).toEqual({});
  });

  test("getFromApplicationData should return empty object from data when id undefined", () => {
    const session = getSessionRequestWithExtraData();
    const boGov: BeneficialOwnerGov = getFromApplicationData(session, BeneficialOwnerGovKey, undefined);

    expect(boGov).not.toBeUndefined();
    expect(boGov).toEqual({});
  });
});
