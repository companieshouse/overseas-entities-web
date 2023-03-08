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
  MOCK_GET_COMPANY_PSC_RESPONSE
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

  test('responds successfully and returns resource', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_RESPONSE);

    const resource = await getCompanyPsc(req, COMPANY_NUMBER);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(serviceNameGetCompanyPsc, fnNameGetCompanyPsc, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(mockDebugRequestLog).toHaveBeenCalled();
    expect(resource).toEqual(MOCK_GET_COMPANY_PSC_RESOURCE);
  });

  test('Should throw an error when httpStatusCode is >= 400', async () => {
    mockMakeApiCallWithRetry.mockResolvedValueOnce(MOCK_GET_COMPANY_PSC_NOT_FOUND_RESPONSE);

    await expect(getCompanyPsc(req, COMPANY_NUMBER)).rejects.toThrow(ERROR);
    expect(mockCreateAndLogErrorRequest).toBeCalledWith(req, 'getCompanyPsc API request returned HTTP status code 404');
    expect(mockDebugRequestLog).not.toHaveBeenCalled();
  });
});
