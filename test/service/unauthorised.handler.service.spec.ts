jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/overseas-entities");

jest.mock("../../src/utils/logger");
jest.mock("../../src/service/refresh.token.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { OverseasEntityService } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

import { logger } from "../../src/utils/logger";
import { unauthorisedResponseHandler } from "../../src/service/unauthorised.handler.service";
import { refreshToken } from "../../src/service/refresh.token.service";
import {
  APPLICATION_DATA_MOCK,
  getSessionRequestWithExtraData,
  mockNewAccessToken,
  OVERSEAS_ENTITY_ID,
  TRANSACTION_ID
} from "../__mocks__/session.mock";

const mockPostOverseasEntity = OverseasEntityService.prototype.postOverseasEntity as jest.Mock;
const mockPutOverseasEntity = OverseasEntityService.prototype.putOverseasEntity as jest.Mock;

const mockDebugRequestLog = logger.debugRequest as jest.Mock;
const mockInfoRequestLog = logger.infoRequest as jest.Mock;

const mockRefreshToken = refreshToken as jest.Mock;
mockRefreshToken.mockReturnValue( mockNewAccessToken );

const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ overseasEntity: OverseasEntityService.prototype } as ApiClient);

const session = getSessionRequestWithExtraData();
const req: Request = {} as Request;

const fnNamePutOE = "putOverseasEntity";
const fnNamePostOE = "postOverseasEntity";

describe(`OE Unauthorised Response Handler test suite`, () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  describe(`${fnNamePostOE} calls`, () => {
    const otherParamsPostOE = [TRANSACTION_ID, APPLICATION_DATA_MOCK, false];

    test(`${fnNamePostOE} should responde with created OE resource`, async () => {
      const mockResponse = { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } };
      mockPostOverseasEntity.mockResolvedValueOnce( mockResponse);

      await unauthorisedResponseHandler(fnNamePostOE, req, session, ...otherParamsPostOE);

      expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
      expect(mockPostOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
      expect(mockInfoRequestLog).not.toHaveBeenCalled();
    });

    test(`${fnNamePostOE} should retry after unauthorised response`, async () => {
      const mockResponse = { httpStatusCode: 401 };
      mockPostOverseasEntity.mockResolvedValueOnce( mockResponse);

      await unauthorisedResponseHandler(fnNamePostOE, req, session, ...otherParamsPostOE);

      expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
      expect(mockPostOverseasEntity).toHaveBeenCalledTimes(2);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(2);

      const responseMsg = `Retrying ${fnNamePostOE} call after unauthorised response`;
      expect(mockDebugRequestLog).toBeCalledWith(req, `${responseMsg} - ${JSON.stringify(mockResponse)}`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);

      expect(mockInfoRequestLog).toBeCalledWith(req, `New access token: ${mockNewAccessToken}`);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePostOE} should return immediately the error if not 401`, async () => {
      const mockResponse = { httpStatusCode: 500 };
      mockPostOverseasEntity.mockResolvedValueOnce( mockResponse);

      const response = await unauthorisedResponseHandler(fnNamePostOE, req, session, ...otherParamsPostOE);

      expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
      expect(response).toEqual(mockResponse);

      expect(mockPostOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
      expect(mockInfoRequestLog).not.toHaveBeenCalled();
    });

  });

  describe(`${fnNamePutOE} calls`, () => {
    const otherParamsPutOE = [TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK];

    test(`${fnNamePutOE} should responde with created httpStatusCode`, async () => {
      const mockResponse = { httpStatusCode: 200 };
      mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);

      await unauthorisedResponseHandler(fnNamePutOE, req, session, ...otherParamsPutOE);

      expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
      expect(mockPutOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
      expect(mockInfoRequestLog).not.toHaveBeenCalled();
    });

    test(`${fnNamePutOE} should retry after unauthorised response`, async () => {
      const mockResponse = { httpStatusCode: 401 };
      mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);

      await unauthorisedResponseHandler(fnNamePutOE, req, session, ...otherParamsPutOE);

      expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
      expect(mockPutOverseasEntity).toHaveBeenCalledTimes(2);
      expect(mockRefreshToken).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(2);

      const responseMsg = `Retrying ${fnNamePutOE} call after unauthorised response`;
      expect(mockDebugRequestLog).toBeCalledWith(req, `${responseMsg} - ${JSON.stringify(mockResponse)}`);
      expect(mockDebugRequestLog).toHaveBeenCalledTimes(1);

      expect(mockInfoRequestLog).toBeCalledWith(req, `New access token: ${mockNewAccessToken}`);
      expect(mockInfoRequestLog).toHaveBeenCalledTimes(1);
    });

    test(`${fnNamePutOE} should return immediately the error if not 401`, async () => {
      const mockResponse = { httpStatusCode: 500 };
      mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);

      const response = await unauthorisedResponseHandler(fnNamePutOE, req, session, ...otherParamsPutOE);

      expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
      expect(response).toEqual(mockResponse);

      expect(mockPutOverseasEntity).toHaveBeenCalledTimes(1);
      expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
      expect(mockDebugRequestLog).not.toHaveBeenCalled();
      expect(mockInfoRequestLog).not.toHaveBeenCalled();
    });

  });

});
