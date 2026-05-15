jest.mock("../../../src/utils/logger");
jest.mock("../../../src/service/company.profile.service");

import { Request, Response } from "express";
import { beforeEach, jest, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { getCompanyProfile } from "../../../src/service/company.profile.service";

import {
  getDataFromEntityCookie,
  saveEntityNumberInCookie,
} from "../../../src/utils/update/data.cookie";

import {
  testEntityName,
  testEntityNumber,
  companyProfileQueryMock,
} from "../../__mocks__/update.entity.mocks";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

describe("Test suite for data cookie in update/remove journey", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompanyProfile.mockReset();
    mockLoggerErrorRequest.mockReset();
  });

  const mockReq = {
    cookies: {
      _roe: JSON.stringify({ e_number: testEntityNumber }),
    }
  } as Request;

  describe("getDataFromEntityCookie", () => {

    test("correctly parses cookie for entity data and fetches matching company profile", async () => {
      mockGetCompanyProfile.mockReturnValue(companyProfileQueryMock);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp.entity_number).toBe(testEntityNumber);
      expect(resp.entity_name).toBe(testEntityName);
    });

    test("returns empty data object if company profile is not found", async () => {
      mockGetCompanyProfile.mockReturnValue(false);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp).toEqual({});
    });
  });

  describe("saveEntityNumberInCookie", () => {

    test("correctly saves entity number to data cookie", async () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;

      await saveEntityNumberInCookie(mockReq, mockRes, testEntityNumber);
      expect(mockRes.cookie).toHaveBeenCalled();
    });
  });
});
