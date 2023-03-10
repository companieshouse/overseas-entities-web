jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import {
  COMPANY_NUMBER,
  ERROR,
  getSessionRequestWithExtraData,
  serviceNameCompanyOfficers,
  fnNameGetCompanyOfficers
} from "../__mocks__/session.mock";
import {
  MOCK_GET_COMPANY_OFFICERS_NOT_FOUND_RESPONSE,
  MOCK_GET_COMPANY_OFFICERS_RESOURCE,
  MOCK_GET_COMPANY_OFFICERS_RESPONSE,
  MOCK_GET_COMPANY_OFFICERS_UNAUTHORISED_RESPONSE
} from "../__mocks__/get.company.officers.mock";
import { getCompanyOfficers } from "../../src/service/company.managing.officer.service";

const mockDebugRequestLog = logger.debugRequest as jest.Mock;

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req: Request = { session } as Request;

const maxResults = 50;

describe('Get company officers for given company number', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('data returned on 200 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_OFFICERS_RESPONSE);

    const resource = await getCompanyOfficers(req, COMPANY_NUMBER);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameCompanyOfficers, fnNameGetCompanyOfficers, req, session, COMPANY_NUMBER, maxResults);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
    expect(resource).toEqual(MOCK_GET_COMPANY_OFFICERS_RESOURCE);
  });

  test('undefined returned on 404 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_OFFICERS_NOT_FOUND_RESPONSE);

    const resource = await getCompanyOfficers(req, COMPANY_NUMBER);
    expect(resource).toEqual(undefined);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
  });

  test('logs error on 401 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_OFFICERS_UNAUTHORISED_RESPONSE);

    await expect(getCompanyOfficers(req, COMPANY_NUMBER)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });
});
