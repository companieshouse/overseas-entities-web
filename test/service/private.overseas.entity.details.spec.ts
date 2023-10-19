jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { Request } from "express";

import { createAndLogErrorRequest } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import { ERROR, getSessionRequestWithExtraData } from "../__mocks__/session.mock";
import {
  getBeneficialOwnersPrivateData, getManagingOfficersPrivateData,
  getPrivateOeDetails
} from "../../src/service/private.overseas.entity.details";

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req = { session } as Request;

const serviceName = 'overseasEntity';
const oeFunctionName = 'getOverseasEntityDetails';
const boFunctionName = 'getBeneficialOwnersPrivateData';
const moFunctionName = 'getManagingOfficersPrivateData';
const transactionId = '13579';
const overseasEntityId = '2468';
const privateOeDetails = { email_address: 'private@overseasentities.test' };

const privateAddress = {
  addressLine1: "addressLine1",
  addressLine2: "addressLine2",
  careOf: "care of information",
  country: "country",
  locality: "locality information",
  poBox: "PO Box information",
  postalCode: "postal code information",
  premises: "premises information",
  region: "region information"
};

const privateBoData = [
  {
    hashedId: "somehashedvalue2783",
    dateBecameRegistrable: "1965-01-01",
    isServiceAddressSameAsUsualAddress: "string",
    dateOfBirth: "1950-01-01",
    usualResidentialAddress: privateAddress,
    principalAddress: privateAddress
  }
];

const privateMoData = [
  {
    residentialAddress: privateAddress,
    principalAddress: privateAddress,
    dateOfBirth: "1980-01-01",
    contactNameFull: "John Doe",
    contactEmailAddress: "john.doe@example.com",
    hashedId: "hashed123456789"
  }
];

describe(`Get private overseas entity details service suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('getPrivateOeDetails should return private OE details from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: privateOeDetails };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getPrivateOeDetails(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, oeFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(privateOeDetails);
  });

  test('getPrivateOeDetails should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getPrivateOeDetails(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, oeFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getPrivateOeDetails should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getPrivateOeDetails(req, transactionId, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getBeneficialOwnerPrivateData should return private beneficial owners data from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: privateBoData };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getBeneficialOwnersPrivateData(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, boFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(privateBoData);
  });

  test('getBeneficialOwnerPrivateData should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getBeneficialOwnersPrivateData(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, boFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getBeneficialOwnerPrivateData should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getBeneficialOwnersPrivateData(req, transactionId, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getManagingOfficerPrivateData should return private managing officer data from response when api response status is 200', async () => {
    const mockResponse = { httpStatusCode: 200, resource: privateMoData };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getManagingOfficersPrivateData(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, moFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(privateMoData);
  });

  test('getManagingOfficerPrivateData should return undefined when api response status is 404', async () => {
    const mockResponse = { httpStatusCode: 404, resource: undefined };

    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getManagingOfficersPrivateData(req, transactionId, overseasEntityId);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceName, moFunctionName, req, session, transactionId, overseasEntityId);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test('getManagingOfficerPrivateData should throw when api response status is 500', async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };

    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getManagingOfficersPrivateData(req, transactionId, overseasEntityId)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });
});
