jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/utils/url");
jest.mock("../../src/service/retry.handler.service");

import { Request } from "express";
import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { isRegistrationJourney, } from "../../src/utils/url";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import { fetchApplicationData } from "../../src/utils/application.data";
import { BAD_REQUEST, UNAUTHORISED } from "../__mocks__/text.mock";

import {
  createOverseasEntity,
  getOverseasEntity,
  updateOverseasEntity
} from "../../src/service/overseas.entities.service";

import {
  APPLICATION_DATA_MOCK,
  ERROR,
  fnNameGetOE,
  fnNamePutOE,
  getSessionRequestWithExtraData,
  OVERSEAS_ENTITY_ID,
  serviceNameOE,
  TRANSACTION_ID,
  FORCE_UPDATE,
  FORCE_FETCH,
} from "../__mocks__/session.mock";

const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockInfoRequestLog = logger.infoRequest as jest.Mock;
const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

const session = getSessionRequestWithExtraData();
const req: Request = { session } as Request;

describe(`Overseas Entity Service test suite`, () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`createOverseasEntity should respond with created httpStatusCode`, async () => {
    const mockResponse = { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } };
    mockMakeApiCallWithRetry.mockReturnValueOnce(mockResponse);
    mockFetchApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    const response = await createOverseasEntity(req, session, TRANSACTION_ID);

    expect(response).toEqual(OVERSEAS_ENTITY_ID);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, "postOverseasEntity", req, session, TRANSACTION_ID, APPLICATION_DATA_MOCK);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postOverseasEntity' for transaction id '${TRANSACTION_ID}'`);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'postOverseasEntity' for transaction id '${TRANSACTION_ID}': ${JSON.stringify(mockResponse)}`);
  });

  test(`createOverseasEntity should respond with created httpStatusCode when application data is supplied directly in the method call`, async () => {
    const mockResponse = { httpStatusCode: 201, resource: { id: OVERSEAS_ENTITY_ID } };
    mockMakeApiCallWithRetry.mockReturnValueOnce(mockResponse);
    const response = await createOverseasEntity(req, session, TRANSACTION_ID, APPLICATION_DATA_MOCK);

    expect(response).toEqual(OVERSEAS_ENTITY_ID);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, "postOverseasEntity", req, session, TRANSACTION_ID, APPLICATION_DATA_MOCK);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postOverseasEntity' for transaction id '${TRANSACTION_ID}'`);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'postOverseasEntity' for transaction id '${TRANSACTION_ID}': ${JSON.stringify(mockResponse)}`);
  });

  test(`createOverseasEntity should respond with UNAUTHORISED error message`, async () => {
    const mockData = { httpStatusCode: 401, errors: [UNAUTHORISED] };
    const errorMsg = `'postOverseasEntity' for transaction id '${TRANSACTION_ID}' encountered an error - ${JSON.stringify(mockData)}`;
    mockMakeApiCallWithRetry.mockReturnValueOnce( mockData );

    await expect( createOverseasEntity(req, undefined as any, TRANSACTION_ID) ).rejects.toThrow(ERROR);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postOverseasEntity' for transaction id '${TRANSACTION_ID}'`);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
  });

  test(`createOverseasEntity should respond with 400 (Bad Request) error message`, async () => {
    const mockData = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `'postOverseasEntity' for transaction id '${TRANSACTION_ID}' encountered an error - ${JSON.stringify(mockData)}`;
    mockMakeApiCallWithRetry.mockReturnValueOnce( mockData );

    await expect( createOverseasEntity(req, undefined as any, TRANSACTION_ID) ).rejects.toThrow(ERROR);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'postOverseasEntity' for transaction id '${TRANSACTION_ID}'`);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
  });

});

describe(`Update Overseas Entity Service test suite`, () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`updateOverseasEntity should respond with created httpStatusCode`, async () => {
    const mockResponse = { httpStatusCode: 200 };
    mockFetchApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await updateOverseasEntity(req, getSessionRequestWithExtraData());

    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'putOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}'`);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'putOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}': ${JSON.stringify(mockResponse)}`);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNamePutOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK, FORCE_UPDATE);
  });

  test(`updateOverseasEntity should respond with created httpStatusCode when application data is supplied directly in the method call`, async () => {
    const mockResponse = { httpStatusCode: 200 };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await updateOverseasEntity(req, getSessionRequestWithExtraData(), APPLICATION_DATA_MOCK);

    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'putOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}'`);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'putOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}': ${JSON.stringify(mockResponse)}`);
    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNamePutOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK, FORCE_UPDATE);
  });

  test(`updateOverseasEntity should respond with 400 (Bad Request) error message`, async () => {
    const mockResponse = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `'putOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}' encountered an error - ${JSON.stringify(mockResponse)}`;
    mockFetchApplicationData.mockReturnValueOnce( APPLICATION_DATA_MOCK );
    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect( updateOverseasEntity(req, session) ).rejects.toThrow(ERROR);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNamePutOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, APPLICATION_DATA_MOCK, FORCE_UPDATE);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'putOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}'`);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
  });

});

describe(`Get Overseas Entity Service test suite`, () => {

  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`getOverseasEntity should respond with successful status code`, async () => {
    const mockResponse = { httpStatusCode: 200, resource: APPLICATION_DATA_MOCK };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    const response = await getOverseasEntity(req, TRANSACTION_ID, OVERSEAS_ENTITY_ID);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNameGetOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, FORCE_FETCH);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'getOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}'`);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Response from 'getOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}': ${JSON.stringify(mockResponse)}`);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(APPLICATION_DATA_MOCK);
  });

  test(`getOverseasEntity should respond with 400 (Bad Request) error message`, async () => {
    const mockResponse = { httpStatusCode: 400, errors: [BAD_REQUEST] };
    const errorMsg = `'getOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}' encountered an error - ${JSON.stringify(mockResponse)}`;

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect( getOverseasEntity(req, TRANSACTION_ID, OVERSEAS_ENTITY_ID, FORCE_FETCH) ).rejects.toThrow(ERROR);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameOE, fnNameGetOE, req, session, TRANSACTION_ID, OVERSEAS_ENTITY_ID, FORCE_FETCH);
    expect(mockInfoRequestLog).toHaveBeenCalledWith(req, `Calling 'getOverseasEntity' for transaction id '${TRANSACTION_ID}' and overseas entity id '${OVERSEAS_ENTITY_ID}'`);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, errorMsg);
  });

});
