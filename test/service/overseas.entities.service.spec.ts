jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/overseas-entities");
jest.mock('../../src/utils/logger');

import { describe, expect, test, jest, beforeEach } from "@jest/globals";

import { OverseasEntityService } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { logger } from '../../src/utils/logger';

import { createOverseasEntity } from "../../src/service/overseas.entities.service";
import { APPLICATION_DATA_MOCK, ERROR, getSessionRequestWithExtraData, TRANSACTION_ID } from "../__mocks__/session.mock";
import { UNAUTHORISED } from "../__mocks__/text.mock";

const mockErrorLog = logger.error as jest.Mock;
const mockPostOverseasEntity = OverseasEntityService.prototype.postOverseasEntity as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ overseasEntity: OverseasEntityService.prototype } as ApiClient);

describe('Overseas Entity Service test suite', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('createOverseasEntity should responde with created httpStatusCode', async () => {
    mockPostOverseasEntity.mockResolvedValueOnce({ httpStatusCode: 201 });
    const response = await createOverseasEntity(getSessionRequestWithExtraData(), TRANSACTION_ID);

    expect(response.httpStatusCode).toEqual(201);
    expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK);
  });

  test('createOverseasEntity should responde with UNAUTHORISED error message', async () => {
    mockPostOverseasEntity.mockResolvedValueOnce({ httpStatusCode: 401, errors: [UNAUTHORISED] });
    const response = await createOverseasEntity( undefined as any, TRANSACTION_ID) as ApiErrorResponse;

    expect(response.httpStatusCode).toEqual(401);
    expect(response.errors).toEqual([UNAUTHORISED]);
  });

  test('createOverseasEntity should catch an error', async () => {
    mockCreateApiClient.mockImplementation( () => { throw ERROR; });
    await createOverseasEntity(getSessionRequestWithExtraData(), TRANSACTION_ID);

    expect(mockErrorLog).toHaveBeenCalledTimes(1);
    expect(mockErrorLog).toBeCalledWith(ERROR);
    expect(mockPostOverseasEntity).not.toHaveBeenCalled();
  });
});
