jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { getApplicationData } from "../../src/utils/application.data";

import {
  createOverseasEntity,
  getCompanyRequest,
  getOverseasEntity,
  updateOverseasEntity
} from "../../src/service/overseas.entities.service";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import {
  APPLICATION_DATA_MOCK,
  companyServiceNameOE,
  COMPANY_NUMBER,
  ERROR,
  fnGetCompanyNameGetOE,
  fnNameGetOE,
  fnNamePutOE,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  serviceNameOE,
  TRANSACTION_ID,
} from "../__mocks__/session.mock";
import { BAD_REQUEST, CREATE_OE__MSG_ERROR, UNAUTHORISED, UPDATE_OE_MSG_ERROR } from "../__mocks__/text.mock";

const mockGetApplicationData = getApplicationData as jest.Mock;
const mockDebugRequestLog = logger.debugRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req: Request = { session } as Request;

describe(`Overseas Entity Service test suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`createOverseasEntity should responde with created httpStatusCode`, async () => {
    mockMakeApiCallWithRetry.mockReturnValueOnce( { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } } );
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    const response = await createOverseasEntity(req, session, TRANSACTION_ID);

    expect(response).toEqual(OVERSEAS_ENTITY_ID);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, "postOverseasEntity", req, session, TRANSACTION_ID, APPLICATION_DATA_MOCK, false);
  });

  test(`createOverseasEntity should responde with UNAUTHORISED error message`, async () => {
    const mockData = { httpStatusCode: 401, errors: [UNAUTHORISED] };
    const errorMsg = `${CREATE_OE__MSG_ERROR} ${TRANSACTION_ID} - ${JSON.stringify(mockData)}`;
    mockMakeApiCallWithRetry.mockReturnValueOnce( mockData );

    await expect( createOverseasEntity(req, undefined as any, TRANSACTION_ID) ).rejects.toThrow(ERROR);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

  test(`createOverseasEntity should responde with 400 (Bad Request) error message`, async () => {
    const mockData = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `${CREATE_OE__MSG_ERROR} ${TRANSACTION_ID} - ${JSON.stringify(mockData)}`;
    mockMakeApiCallWithRetry.mockReturnValueOnce( mockData );

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
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await updateOverseasEntity(req, getSessionRequestWithExtraData());

    expect(mockDebugRequestLog).toHaveBeenCalledWith(req, `Updated Overseas Entity, ${JSON.stringify(mockResponse)}`);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNamePutOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
  });

  test(`updateOverseasEntity should responde with 400 (Bad Request) error message`, async () => {
    const mockResponse = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorContext = `${UPDATE_OE_MSG_ERROR}, Transaction Id: ${TRANSACTION_ID}, Overseas Entity Id: ${OVERSEAS_ENTITY_ID}`;
    const errorMsg = `${errorContext}, Response: ${JSON.stringify(mockResponse)}`;
    mockGetApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect( updateOverseasEntity(req, session) ).rejects.toThrow(ERROR);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNamePutOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

});

describe(`Get overseas entity profile details`, () => {
  const GET_OE_MSG_ERROR = "Something went wrong getting Overseas Entity";
  const INFO_MSG = `OE NUMBER ID: ${COMPANY_NUMBER}`;

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`getCompanyRequest should respond with successful status code`, async () => {
    const mockResponse = { httpStatusCode: 200, resource: APPLICATION_DATA_MOCK };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);
    const response = await getCompanyRequest(req, COMPANY_NUMBER);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(companyServiceNameOE, fnGetCompanyNameGetOE, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(APPLICATION_DATA_MOCK);
  });

  test(`getCompanyRequest should respond with 400 (Bad Request) error message`, async () => {
    const mockResponse = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `${GET_OE_MSG_ERROR} - ${INFO_MSG} - ${JSON.stringify(mockResponse)}`;

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect( getCompanyRequest(req, COMPANY_NUMBER) ).rejects.toThrow(ERROR);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(companyServiceNameOE, fnGetCompanyNameGetOE, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });
});
describe(`Get Overseas Entity Service test suite`, () => {
  const GET_OE_MSG_ERROR = "Something went wrong getting Overseas Entity";
  const INFO_MSG = `Transaction ID: ${TRANSACTION_ID}, OverseasEntity ID: ${OVERSEAS_ENTITY_ID}`;

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`getOverseasEntity should responde with successful status code`, async () => {
    const mockResponse = { httpStatusCode: 200, resource: APPLICATION_DATA_MOCK };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    const response = await getOverseasEntity(req, TRANSACTION_ID, OVERSEAS_ENTITY_ID);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNameGetOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID);
    expect(mockDebugRequestLog).toHaveBeenCalledWith(req, `Overseas Entity Retrieved - ${INFO_MSG}`);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(APPLICATION_DATA_MOCK);
  });

  test(`getOverseasEntity should responde with 400 (Bad Request) error message`, async () => {
    const mockResponse = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `${GET_OE_MSG_ERROR} - ${INFO_MSG} - ${JSON.stringify(mockResponse)}`;

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect( getOverseasEntity(req, TRANSACTION_ID, OVERSEAS_ENTITY_ID) ).rejects.toThrow(ERROR);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNameGetOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

});
