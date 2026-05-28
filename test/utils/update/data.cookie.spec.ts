
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/service/company.profile.service");

import { Request, Response } from "express";
import { beforeEach, jest, describe } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { EntityNumberKey } from "../../../src/model/data.types.model";
import { getCompanyProfile } from "../../../src/service/company.profile.service";

import {
  getDataFromEntityCookie,
  saveDataToCookie,
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
      _roe: JSON.stringify({ entity_number: testEntityNumber }),
    }
  } as Request;

  describe("getDataFromEntityCookie", () => {

    test("correctly parses cookie for entity data and fetches matching company profile", async () => {
      mockGetCompanyProfile.mockReturnValue(companyProfileQueryMock);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp.entity_number).toBe(testEntityNumber);
      expect(resp.entity_name).toBe(testEntityName);
    });

    test("returns data object with only the entity number if company details are not found", async () => {
      mockGetCompanyProfile.mockReturnValue(false);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp).toEqual({ [EntityNumberKey]: testEntityNumber });
    });
  });

  describe("saveDataToCookie", () => {

    test("correctly saves entity number to data cookie", async () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      await saveDataToCookie(mockReq, mockRes, 'e_number', testEntityNumber);
      expect(mockRes.cookie).toHaveBeenCalled();
    });
  });
});
