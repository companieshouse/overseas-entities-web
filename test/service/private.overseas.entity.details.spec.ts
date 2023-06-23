jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { Request } from "express";

import { createAndLogErrorRequest } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import { ERROR, getSessionRequestWithExtraData } from "../__mocks__/session.mock";
import { getPrivateOeDetails, hasRetrievedPrivateOeDetails } from "../../src/service/private.overseas.entity.details";

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req = { session } as Request;

const serviceName = 'overseasEntity';
const functionName = 'getOverseasEntityDetails';
const overseasEntityId = '123123-123123-1231-123';
const privateOeDetails = { email_address: 'private@overseasentities.test' };

describe(`Get private overseas entity details service suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('hasRetrievedPrivateOeDetails should return true when appData contains entity email address', () => {
    const appData = { entity: { email: 'private@overseasentities.test' } };

    const result = hasRetrievedPrivateOeDetails(appData);

    expect(result).toBe(true);
  });

  test.each([
    ['no entity exists', undefined ],
    ['no email exists', {} ],
    ['email is empty', { email: '' } ],
  ])('hasRetrievedPrivateOeDetails should return false when %p', (_, entity) => {
    const appData = { entity };

    const result = hasRetrievedPrivateOeDetails(appData);

    expect(result).toBe(false);
  });

  test('getPrivateOeDetails should return private OE details from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: privateOeDetails };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getPrivateOeDetails(req, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, functionName, req, session, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(privateOeDetails);
  });

  test('getPrivateOeDetails should throw an error when no data in response and status is 200', async () => {
    const mockResponse = { httpStatusCode: 200 };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect(getPrivateOeDetails(req, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getPrivateOeDetails should throw when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: privateOeDetails };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    await expect(getPrivateOeDetails(req, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getPrivateOeDetails should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getPrivateOeDetails(req, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });
});
