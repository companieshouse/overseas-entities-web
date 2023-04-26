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
} from "../__mocks__/session.mock";
import { getCompanyProfile } from "../../src/service/company.profile.service";

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
});
