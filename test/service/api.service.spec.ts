import { describe, expect, test } from "@jest/globals";
import { createOAuthApiClient, createApiKeyClient } from "../../src/service/api.service";
import { getSessionRequestWithPermission } from "../__mocks__/session.mock";

describe('API Service test suite', () => {
  test('createOAuthApiClient should return a new API Client, uses user\'s oauth token', () => {
    const apiClientResponse = createOAuthApiClient(getSessionRequestWithPermission());
    expect(apiClientResponse).not.toBeNull();
  });
  test('createpiKeyClient should return a new API Client, to use api key for authentication', () => {
    const apiClientResponse = createApiKeyClient();
    expect(apiClientResponse).not.toBeNull();
  });
});
