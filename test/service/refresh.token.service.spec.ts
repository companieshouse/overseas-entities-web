jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/refresh-token/service");
jest.mock('../../src/utils/logger');

import { Request } from "express";
import { describe, expect, test, jest, beforeEach } from "@jest/globals";

import { createApiClient } from "@companieshouse/api-sdk-node";
import * as RefreshTokenService from "@companieshouse/api-sdk-node/dist/services/refresh-token/service";

import { ERROR, getSessionRequestWithExtraData } from "../__mocks__/session.mock";
import { refreshToken } from "../../src/service/refresh.token.service";
import { createAndLogErrorRequest } from '../../src/utils/logger';
import { ERROR_REFRESH_TOKEN } from "../__mocks__/text.mock";

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ refreshToken: RefreshTokenService.default.prototype });

const mockRefreshToken = RefreshTokenService.default.prototype.refresh as jest.Mock;
const session = getSessionRequestWithExtraData();
const req: Request = {} as Request;

describe('RefreshToken Service test suite', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe('POST Refresh Token', () => {
    test('Should successfully return the refresh Token', async () => {
      const mockResourceSuccess = {
        expires_in: "123456789",
        token_type: "Bearer",
        access_token: "qBU6uMyXSTcKt1VHn1VMOLjhZdjwRE"
      };
      mockRefreshToken.mockResolvedValueOnce({ httpStatusCode: 200, resource: mockResourceSuccess });
      const response = await refreshToken(req, session) as any;

      expect(response).toEqual(mockResourceSuccess.access_token);
      expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    });

    test(`Should throw an error when error returned from the sdk call`, async () => {
      const mockResourceError = { httpStatusCode: 400, error: "Invalid parameter" };
      mockRefreshToken.mockResolvedValueOnce(mockResourceError);

      await expect( refreshToken(req, session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `${ERROR_REFRESH_TOKEN} ${JSON.stringify(mockResourceError)}`);
    });

    test(`Should throw an error when a correct resource with no access_token returned`, async () => {
      const mockResource = { httpStatusCode: 200, resource: "something_else" };
      mockRefreshToken.mockResolvedValueOnce(mockResource);

      await expect( refreshToken(req, session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `${ERROR_REFRESH_TOKEN} ${JSON.stringify(mockResource)}`);
    });

    test(`Should throw an error when an empty object has returned from the sdk call`, async () => {
      mockRefreshToken.mockResolvedValueOnce(null);

      await expect( refreshToken(req, session) ).rejects.toThrow(ERROR);
      expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `${ERROR_REFRESH_TOKEN} null`);
    });
  });

});
