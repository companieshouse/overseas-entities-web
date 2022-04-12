import { Session } from '@companieshouse/node-session-handler';
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createApiClient } from "@companieshouse/api-sdk-node";

import { getAccessToken } from "../utils/session";
import { API_URL, CHS_API_KEY } from '../config';

export const createOAuthApiClient = (session: Session | undefined): ApiClient => {
  return createApiClient(undefined, getAccessToken(session), API_URL);
};

export const createApiKeyClient = (): ApiClient => {
  return createApiClient(CHS_API_KEY, undefined, API_URL);
};
