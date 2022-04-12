import { describe, expect, test } from '@jest/globals';
import { Session } from '@companieshouse/node-session-handler';

import { ACCESS_TOKEN_MOCK, getSessionRequestWithPermission, userMail } from '../__mocks__/session.mock';
import { checkUserSignedIn, getAccessToken, getLoggedInUserEmail } from "../../src/utils/session";

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

  test('Test function getAccessToken() return Access Token from session', () => {
    expect(getAccessToken(testSessionWithPermission)).toEqual(ACCESS_TOKEN_MOCK.access_token);
  });

  test('Test function getAccessToken() return blank values if session is null', () => {
    expect(getAccessToken(null)).toBeFalsy;
  });
});
