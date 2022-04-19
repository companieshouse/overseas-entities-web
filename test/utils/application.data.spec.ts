import { describe, expect, test } from '@jest/globals';
import {
  getApplicationData,
  setApplicationData,
  prepareData,
  deleteApplicationData,
  mapAddressToObjectField,
  mapObjectFieldToAddress,
} from "../../src/utils/application.data";
import {
  ADDRESS,
  ADDRESS_FIELDS_MOCK,
  ADDRESS_MOCK,
  APPLICATION_DATA_MOCK,
  BENEFICIAL_OWNER_INDIVIDUAL_OBJECT_MOCK,
  ENTITY_OBJECT_MOCK,
  getSessionRequestWithExtraData,
  getSessionRequestWithPermission,
} from "../__mocks__/session.mock";
import { beneficialOwnerIndividualType, entityType } from "../../src/model";

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

  test("mapAddressToObjectField should map address to address fields present on the view", () => {
    const response = mapAddressToObjectField(ADDRESS, ADDRESS_FIELDS_MOCK);
    expect(response).toEqual(ADDRESS_MOCK);
  });

  test("mapObjectFieldToAddress should map address fields coming from the view to address", () => {
    const response = mapObjectFieldToAddress(ADDRESS_MOCK, ADDRESS_FIELDS_MOCK);
    expect(response).toEqual(ADDRESS);
  });

});
