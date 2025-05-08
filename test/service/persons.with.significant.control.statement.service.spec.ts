jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import {
  serviceNameGetCompanyPscStatements,
  fnNameGetCompanyPscStatements,
  COMPANY_NUMBER,
  ERROR,
  getSessionRequestWithExtraData,
} from "../__mocks__/session.mock";
import {
  MOCK_GET_COMPANY_PSC_STATEMENTS_NOT_FOUND_RESPONSE,
  MOCK_GET_COMPANY_PSC_STATEMENTS_RESPONSE,
  MOCK_GET_COMPANY_PSC_STATEMENTS_UNAUTHORISED_RESPONSE,
  MOCK_GET_COMPANY_PSC_STATEMENTS_RESOURCE_INDIVIDUAL
} from "../__mocks__/get.company.psc.statement.mock";
import { getCompanyPscStatements } from "../../src/service/persons.with.signficant.control.statement.service";

const mockDebugRequestLog = logger.debugRequest as jest.Mock;

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req: Request = { session } as Request;
describe('Get persons with significant control statement service that calls API for given company number', () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test('data returned on 200 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_STATEMENTS_RESPONSE);

    const resource = await getCompanyPscStatements(req, COMPANY_NUMBER);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameGetCompanyPscStatements, fnNameGetCompanyPscStatements, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
    expect(resource).toEqual(MOCK_GET_COMPANY_PSC_STATEMENTS_RESOURCE_INDIVIDUAL);
  });

  test('logs error on 401 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_STATEMENTS_UNAUTHORISED_RESPONSE);

    await expect(getCompanyPscStatements(req, COMPANY_NUMBER)).rejects.toThrow(ERROR);

    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });

  test('undefined returned on 404 response from API', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_STATEMENTS_NOT_FOUND_RESPONSE);

    const resource = await getCompanyPscStatements(req, COMPANY_NUMBER);
    expect(resource).toEqual(undefined);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
  });
});
