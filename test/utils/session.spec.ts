import { describe, expect, test } from '@jest/globals';
import { Session } from '@companieshouse/node-session-handler';

import { getSessionRequestWithPermission, userMail } from '../__mocks__/session.mock';
import { checkUserSignedIn, getLoggedInUserEmail } from "../../src/utils/session";

describe('Utils Session', () => {
  const testSessionWithPermission: Session = getSessionRequestWithPermission();

  test('Test function getLoggedInUserEmail(), return correct mail from session', () => {
    expect(getLoggedInUserEmail(testSessionWithPermission)).toEqual(userMail);
  });

  test('Test function getLoggedInUserEmail() when session is empty', () => {
    expect(getLoggedInUserEmail({})).toBeUndefined;
  });

  test('Test function checkUserSignedIn() return true if user is signin', () => {
    expect(checkUserSignedIn(testSessionWithPermission)).toBeTruthy;
  });

  test('Test function checkUserSignedIn() return false if session is null', () => {
    expect(checkUserSignedIn(null)).toBeFalsy;
  });
});
