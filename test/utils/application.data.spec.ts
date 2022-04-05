import { describe, expect, test } from '@jest/globals';
import {
  getApplicationData,
  setApplicationData,
  prepareData,
  deleteApplicationData,
} from "../../src/utils/application.data";
import {
  APPLICATION_DATA_MOCK,
  ENTITY_OBJECT_MOCK,
  getSessionRequestWithExtraData,
  getSessionRequestWithPermission,
} from "../__mocks__/session.mock";
import { entityType } from "../../src/model";

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

  test("setApplicationData should return undefined if session is not defined", () => {
    // Session at this level can not be undefined, avoid checking req.session type, so
    // we return void if everything is ok, otherwise undefined, where void is not an alias for undefined.
    expect(setApplicationData(undefined, ENTITY_OBJECT_MOCK, entityType.EntityKey)).toEqual(undefined);
  });

  test("prepareData should store application data into the session", () => {
    const data = prepareData(ENTITY_OBJECT_MOCK, ['legalForm', 'email']);
    const { legalForm, email } = ENTITY_OBJECT_MOCK;
    expect(data).toEqual( { legalForm, email } );
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

});
