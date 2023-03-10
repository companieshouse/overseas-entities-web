jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import {
  serviceNameGetCompanyPsc,
  fnNameGetCompanyPsc,
  COMPANY_NUMBER,
  ERROR,
  getSessionRequestWithExtraData,
} from "../__mocks__/session.mock";
import {
  MOCK_GET_COMPANY_PSC_NOT_FOUND_RESPONSE,
  MOCK_GET_COMPANY_PSC_RESOURCE,
  MOCK_GET_COMPANY_PSC_RESPONSE,
  MOCK_GET_COMPANY_PSC_UNAUTHORISED_RESPONSE
} from "../__mocks__/get.company.psc.mock";
import { getCompanyPsc } from "../../src/service/persons.with.signficant.control.service";

const mockDebugRequestLog = logger.debugRequest as jest.Mock;

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req: Request = { session } as Request;
describe('Get persons with significant control service that calls API for given company number', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('data returned on 200 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_RESPONSE);

    const resource = await getCompanyPsc(req, COMPANY_NUMBER);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameGetCompanyPsc, fnNameGetCompanyPsc, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
    expect(resource).toEqual(MOCK_GET_COMPANY_PSC_RESOURCE);
  });

  test('logs error on 401 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_UNAUTHORISED_RESPONSE);

    await expect(getCompanyPsc(req, COMPANY_NUMBER)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

  test('undefined returned on 404 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_NOT_FOUND_RESPONSE);

    const resource = await getCompanyPsc(req, COMPANY_NUMBER);
    expect(resource).toEqual(undefined);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
  });
});
