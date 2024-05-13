jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/application.data");
jest.mock("../../src/service/retry.handler.service");

import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import { Request } from "express";

import { createAndLogErrorRequest } from "../../src/utils/logger";
import { makeApiCallWithRetry } from "../../src/service/retry.handler.service";
import {
  APPLICATION_DATA_MOCK,
  companyServiceNameOE,
  COMPANY_NUMBER,
  ERROR,
  fnGetCompanyNameGetOE,
  getSessionRequestWithExtraData,
  COMPANY_PROFILE_WITH_CONFIRMATION_STATEMENT_MOCK_DATA,
  OVER_SEAS_ENTITY_MOCK_DATA,
} from "../__mocks__/session.mock";
import { getCompanyProfile, getConfirmationStatementNextMadeUpToDateAsIsoString } from "../../src/service/company.profile.service";

const mockCreateAndLogErrorRequest = createAndLogErrorRequest as jest.Mock;
mockCreateAndLogErrorRequest.mockReturnValue(ERROR);

const mockMakeApiCallWithRetry = makeApiCallWithRetry as jest.Mock;

const session = getSessionRequestWithExtraData();
const req: Request = { session } as Request;

describe(`Get overseas entity profile details service suite`, () => {
  beforeEach (() => {
    jest.clearAllMocks();
  });

  test(`getCompanyRequest should respond with successful status code`, async () => {
    const mockResponse = { httpStatusCode: 200, resource: APPLICATION_DATA_MOCK };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    const response = await getCompanyProfile(req, COMPANY_NUMBER);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(companyServiceNameOE, fnGetCompanyNameGetOE, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(APPLICATION_DATA_MOCK);
  });

  test(`getCompanyRequest should respond with no data found on 404`, async () => {
    const mockResponse = { httpStatusCode: 404, resource: {} };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    const response = await getCompanyProfile(req, COMPANY_NUMBER);

    expect(mockMakeApiCallWithRetry).toBeCalledWith(companyServiceNameOE, fnGetCompanyNameGetOE, req, session, COMPANY_NUMBER);
    expect(mockCreateAndLogErrorRequest).not.toHaveBeenCalled();
    expect(response).toEqual(undefined);
  });

  test(`getCompanyRequest should throw with 500 status code`, async () => {
    const mockResponse = { httpStatusCode: 500, resource: {} };
    mockMakeApiCallWithRetry.mockResolvedValueOnce( mockResponse);

    await expect(getCompanyProfile(req, COMPANY_NUMBER)).rejects.toThrow(ERROR);
    expect(mockCreateAndLogErrorRequest).toHaveBeenCalled();
  });

  test('getConfirmationStatementNextMadeUpToDate should return the next made up to date', async () => {
    const mockResponse = { httpStatusCode: 200, resource: COMPANY_PROFILE_WITH_CONFIRMATION_STATEMENT_MOCK_DATA };
    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getConfirmationStatementNextMadeUpToDateAsIsoString(req, COMPANY_NUMBER);
    expect(response).toEqual("2024-08-26");
  });

  test('getConfirmationStatementNextMadeUpToDate should return undefined if the next made up to date is not present', async () => {
    const mockResponse = { httpStatusCode: 200, resource: OVER_SEAS_ENTITY_MOCK_DATA };
    mockMakeApiCallWithRetry.mockResolvedValueOnce(mockResponse);

    const response = await getConfirmationStatementNextMadeUpToDateAsIsoString(req, COMPANY_NUMBER);
    expect(response).toEqual(undefined);
  });
});
