jest.mock("../../src/utils/feature.flag" );

import { describe, expect, test, jest } from '@jest/globals';

import { CHANGE_LINK, CHANGE_LINK_NAME_PRESENTER, DATA_EVENT_ID } from '../__mocks__/text.mock';
import { PRESENTER_CHANGE_FULL_NAME } from '../../src/config';
import { createChangeLinkConfig } from '../../src/utils/change.link';
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockImplementation( () => true );

describe('createChangeLinkConfig test suite', () => {

  test('should check if the object returned is correct, and contains the change link configs', () => {
    const testChangeLinkConfig = createChangeLinkConfig(PRESENTER_CHANGE_FULL_NAME, CHANGE_LINK_NAME_PRESENTER, DATA_EVENT_ID) as any;
    expect(testChangeLinkConfig.text).toEqual(CHANGE_LINK);
    expect(testChangeLinkConfig.href).toEqual(PRESENTER_CHANGE_FULL_NAME);
    expect(testChangeLinkConfig.visuallyHiddenText).toEqual(CHANGE_LINK_NAME_PRESENTER);
    expect(testChangeLinkConfig.attributes['data-event-id']).toEqual(DATA_EVENT_ID);
  });

  test('should return an empty string when change links feature flag is false', () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const testChangeLinkConfig = createChangeLinkConfig(PRESENTER_CHANGE_FULL_NAME, CHANGE_LINK_NAME_PRESENTER, DATA_EVENT_ID);
    expect(testChangeLinkConfig).toEqual("");
  });

});
