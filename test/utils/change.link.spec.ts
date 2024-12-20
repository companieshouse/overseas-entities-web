import { createChangeLinkConfig } from '../../src/utils/change.link';
import { PRESENTER_CHANGE_FULL_NAME } from '../../src/config';
import {
  CHANGE_LINK,
  CHANGE_LINK_NAME_PRESENTER,
  DATA_EVENT_ID
} from '../__mocks__/text.mock';

describe('createChangeLinkConfig test suite', () => {

  test('should check if the object returned is correct, and contains the change link configs', () => {
    const testChangeLinkConfig = createChangeLinkConfig(PRESENTER_CHANGE_FULL_NAME, CHANGE_LINK_NAME_PRESENTER, DATA_EVENT_ID) as any;
    expect(testChangeLinkConfig.text).toEqual(CHANGE_LINK);
    expect(testChangeLinkConfig.href).toEqual(PRESENTER_CHANGE_FULL_NAME);
    expect(testChangeLinkConfig.visuallyHiddenText).toEqual(CHANGE_LINK_NAME_PRESENTER);
    expect(testChangeLinkConfig.attributes['data-event-id']).toEqual(DATA_EVENT_ID);
  });
});
