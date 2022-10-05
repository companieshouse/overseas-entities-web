import ApiClient from '@companieshouse/api-sdk-node/dist/client';
import { Session } from '@companieshouse/node-session-handler';

import { OAUTH2_CLIENT_ID, OAUTH2_CLIENT_SECRET, REFRESH_TOKEN_GRANT_TYPE } from '../config';
import { createAndLogErrorRequest, logger } from '../utils/logger';
import { getAccessToken, getRefreshToken, setAccessToken } from '../utils/session';
import { createOAuthApiClient } from './api.service';

export const refreshToken = async (req, session: Session): Promise<string> => {
  const apiClient: ApiClient = createOAuthApiClient(session);

  logger.infoRequest(req, `Making a POST request for refreshing access token ${getAccessToken(session)}`);

  const refreshTokenData = await apiClient.refreshToken.refresh(
    getRefreshToken(session),
    REFRESH_TOKEN_GRANT_TYPE,
    OAUTH2_CLIENT_ID,
    OAUTH2_CLIENT_SECRET
  ) as any;
  const accessToken = refreshTokenData?.resource?.access_token;

  if (!accessToken) {
    throw createAndLogErrorRequest(req, `Error on refresh token ${JSON.stringify(refreshTokenData)}`);
  }

  setAccessToken(session, accessToken);

  return accessToken;
};
