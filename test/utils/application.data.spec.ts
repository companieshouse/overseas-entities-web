import { describe, expect, test } from '@jest/globals';
import { getApplicationData, setApplicationData } from "../../src/utils/application.data";
import { APPLICATION_DATA_MOCK, ENTITY_OBJECT_MOCK, getSessionRequestWithExtraData } from '../__mocks__/session.mock';
import { EntityKey } from "../../src/model";

describe("Application data utils", () => {
  test("getApplicationData should return Extra data store in the session", () => {
    const session = getSessionRequestWithExtraData();
    const data = getApplicationData(session);
    expect(data).toEqual(APPLICATION_DATA_MOCK);
  });
  test("setApplicationData should store application data into the session", () => {
    const session = getSessionRequestWithExtraData();
    setApplicationData(session, ENTITY_OBJECT_MOCK, EntityKey);

    const data = getApplicationData(session);
    expect(data).toEqual( { ...APPLICATION_DATA_MOCK, [EntityKey]: { ...ENTITY_OBJECT_MOCK } });
  });
});
