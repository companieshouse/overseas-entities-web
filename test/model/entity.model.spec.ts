import { describe, expect, test } from '@jest/globals';
import { ApplicationData } from '../../src/model';
import { HasSamePrincipalAddressKey } from '../../src/model/data.types.model';

import { Entity, EntityKeys } from '../../src/model/entity.model';
import { getApplicationData } from "../../src/utils/application.data";
import { getSessionRequestWithExtraData } from "../__mocks__/session.mock";

describe("ENTITY model", () => {
  let session;
  let appData;
  let entityDataKeys;

  beforeAll(async () => {
    session = getSessionRequestWithExtraData();
    appData = await getApplicationData(session) as ApplicationData;
    entityDataKeys = Object.keys(appData.entity as Entity);
  });

  test("ENTITY keys to be equal to EntityKeys object", () => {
    expect(entityDataKeys).toEqual(EntityKeys);
  });

  test("HasSameAddressKey is a ENTITY key", () => {
    expect(entityDataKeys.includes(HasSamePrincipalAddressKey)).toBeTruthy();
  });
});
