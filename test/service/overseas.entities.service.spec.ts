jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/overseas-entities");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { OverseasEntityService } from "@companieshouse/api-sdk-node/dist/services/overseas-entities";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { getApplicationData } from "../../src/utils/application.data";

import { createOverseasEntity, updateOverseasEntity } from "../../src/service/overseas.entities.service";
import {
  APPLICATION_DATA_MOCK,
  ERROR,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  TRANSACTION_ID,
} from "../__mocks__/session.mock";
import { BAD_REQUEST, CREATE_OE__MSG_ERROR, UNAUTHORISED, UPDATE_OE_MSG_ERROR } from "../__mocks__/text.mock";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockDebugRequestLog = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockPostOverseasEntity = OverseasEntityService.prototype.postOverseasEntity as jest.Mock;
const mockPutOverseasEntity = OverseasEntityService.prototype.putOverseasEntity as jest.Mock;
const mockCreateApiClient = createApiClient as jest.Mock;
mockCreateApiClient.mockReturnValue({ overseasEntity: OverseasEntityService.prototype } as ApiClient);

const req: Request = {} as Request;

describe(`Overseas Entity Service test suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`createOverseasEntity should responde with created httpStatusCode`, async () => {
    mockPostOverseasEntity.mockResolvedValueOnce( { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } });
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    const response = await createOverseasEntity(req, getSessionRequestWithExtraData(), TRANSACTION_ID);

    expect(response).toEqual(OVERSEAS_ENTITY_ID);
    expect(mockPostOverseasEntity).toBeCalledWith(TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
  });

  test(`createOverseasEntity should responde with UNAUTHORISED error message`, async () => {
    const mockData = { httpStatusCode: 401, errors: [UNAUTHORISED] };
    mockPostOverseasEntity.mockResolvedValueOnce(mockData);

    await expect( createOverseasEntity(req, undefined as any, TRANSACTION_ID) ).rejects.toThrow(ERROR);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, `${CREATE_OE__MSG_ERROR} ${TRANSACTION_ID} - ${JSON.stringify(mockData)}`);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

  test(`createOverseasEntity should responde with 400 (Bad Request) error message`, async () => {
    const mockData = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `${CREATE_OE__MSG_ERROR} ${TRANSACTION_ID} - ${JSON.stringify(mockData)}`;
    mockPostOverseasEntity.mockResolvedValueOnce(mockData);

    await expect( createOverseasEntity(req, undefined as any, TRANSACTION_ID) ).rejects.toThrow(ERROR);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

});

describe(`Update Overseas Entity Service test suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`updateOverseasEntity should responde with created httpStatusCode`, async () => {
    const mockResponse = { httpStatusCode: 200 };
    mockPutOverseasEntity.mockResolvedValueOnce( mockResponse);
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    await updateOverseasEntity(req, getSessionRequestWithExtraData());

    expect(mockDebugRequestLog).toHaveBeenCalledWith(req, `Updated Overseas Entity, ${JSON.stringify(mockResponse)}`);
    expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
  });

  test(`updateOverseasEntity should responde with 400 (Bad Request) error message`, async () => {
    const mockResponse = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorContext = `${UPDATE_OE_MSG_ERROR}, Transaction Id: ${TRANSACTION_ID}, Overseas Entity Id: ${OVERSEAS_ENTITY_ID}`;
    const errorMsg = `${errorContext}, Response: ${JSON.stringify(mockResponse)}`;
    mockPutOverseasEntity.mockResolvedValueOnce(mockResponse);
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );

    await expect( updateOverseasEntity(req, undefined as any) ).rejects.toThrow(ERROR);
    expect(mockPutOverseasEntity).toBeCalledWith(TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

});
