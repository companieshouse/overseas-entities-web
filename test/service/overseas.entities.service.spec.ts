jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/overseas-entities");
jest.mock('../../src/utils/logger');

import { describe, expect, test, jest, beforeEach } from "@jest/globals";

import { OverseasEntityService } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createAndLogErrorRequest, logger } from '../../src/utils/logger';

import { createOverseasEntity } from "../../src/service/overseas.entities.service";
import {
  APPLICATION_DATA_MOCK,
  ERROR,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  TRANSACTION_ID,
} from "../__mocks__/session.mock";
import { CREATE_OE__MSG_ERROR, UNAUTHORISED } from "../__mocks__/text.mock";
import { Request } from "express";

let req: Request;
const mockDebugLog = logger.debug as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockPostOverseasEntity = OverseasEntityService.prototype.postOverseasEntity as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ overseasEntity: OverseasEntityService.prototype } as ApiClient);

describe('Overseas Entity Service test suite', () => {
  beforeEach (() => {
    jest.clearAllMocks();
    req = {} as Request;
  });

  test('createOverseasEntity should responde with created httpStatusCode', async () => {
    mockPostOverseasEntity.mockResolvedValueOnce( { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } });
    const response = await createOverseasEntity(req, getSessionRequestWithExtraData(), TRANSACTION_ID);

    expect(response.id).toEqual(OVERSEAS_ENTITY_ID);
    expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK);
  });

  test('createOverseasEntity should responde with UNAUTHORISED error message', async () => {
    const mockData = { httpStatusCode: 401, errors: [UNAUTHORISED] };
    mockPostOverseasEntity.mockResolvedValueOnce(mockData);

    await expect( createOverseasEntity(req, undefined as any, TRANSACTION_ID) ).rejects.toThrow(ERROR);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `${CREATE_OE__MSG_ERROR} ${TRANSACTION_ID} - ${JSON.stringify(mockData)}`);
    expect(mockDebugLog).not.toHaveBeenCalled();
  });

});
