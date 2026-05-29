
jest.mock("../../../src/utils/logger");
jest.mock("../../../src/service/company.profile.service");
jest.mock("../../../src/utils/update/mapper.utils");
jest.mock("../../../src/utils/update/company.profile.mapper.to.overseas.entity");

import { Request, Response } from "express";
import { beforeEach, jest, describe, test, expect } from "@jest/globals";
import { logger } from "../../../src/utils/logger";
import { EntityNumberKey, EntityCookieKey } from "../../../src/model/data.types.model";
import { getCompanyProfile } from "../../../src/service/company.profile.service";
import { mapInputDate } from "../../../src/utils/update/mapper.utils";
import { mapCompanyProfileToOverseasEntity } from "../../../src/utils/update/company.profile.mapper.to.overseas.entity";

import {
  getDataFromEntityCookie,
  saveDataToCookie,
  removeEntityCookie,
} from "../../../src/utils/update/data.cookie";

import {
  testEntityName,
  testEntityNumber,
  companyProfileQueryMock,
} from "../../__mocks__/update.entity.mocks";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockMapInputDate = mapInputDate as jest.Mock;
const mockMapCompanyProfileToOverseasEntity = mapCompanyProfileToOverseasEntity as jest.Mock;

const MOCK_ENTITY_OBJECT = { incorporation_country: "Ireland" };
const MOCK_DATE = { day: "01", month: "01", year: "2000" };

describe("Test suite for data cookie in update/remove journey", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompanyProfile.mockReset();
    mockLoggerErrorRequest.mockReset();
    mockMapInputDate.mockReturnValue(MOCK_DATE);
    mockMapCompanyProfileToOverseasEntity.mockReturnValue(MOCK_ENTITY_OBJECT);
  });

  const mockReq = {
    cookies: {
      [EntityCookieKey]: JSON.stringify({ [EntityNumberKey]: testEntityNumber }),
    }
  } as Request;

  const mockReqNoCookie = {
    cookies: {}
  } as Request;

  describe("getDataFromEntityCookie", () => {

    test("correctly parses cookie for entity data and fetches matching company profile", async () => {
      mockGetCompanyProfile.mockReturnValue(companyProfileQueryMock);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp.entity_number).toBe(testEntityNumber);
      expect(resp.entity_name).toBe(testEntityName);
    });

    test("returns entity object and update date from mapped company profile", async () => {
      mockGetCompanyProfile.mockReturnValue(companyProfileQueryMock);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp.entity).toEqual(MOCK_ENTITY_OBJECT);
      expect(resp.update).toEqual({ date_of_creation: MOCK_DATE });
      expect(mockMapCompanyProfileToOverseasEntity).toHaveBeenCalledWith(companyProfileQueryMock);
      expect(mockMapInputDate).toHaveBeenCalledWith(companyProfileQueryMock.dateOfCreation);
    });

    test("returns data object with only the entity number if company details are not found", async () => {
      mockGetCompanyProfile.mockReturnValue(false);
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp).toEqual({ [EntityNumberKey]: testEntityNumber });
      expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
    });

    test("returns empty cookie data when no entity_number is present in cookie", async () => {
      const reqWithoutEntityNumber = {
        cookies: {
          [EntityCookieKey]: JSON.stringify({ some_other_key: "value" }),
        }
      } as Request;
      const resp = await getDataFromEntityCookie(reqWithoutEntityNumber);
      expect(resp).toEqual({ some_other_key: "value" });
      expect(mockGetCompanyProfile).not.toHaveBeenCalled();
    });

    test("returns empty object when cookie is not present", async () => {
      const resp = await getDataFromEntityCookie(mockReqNoCookie);
      expect(resp).toEqual({});
      expect(mockGetCompanyProfile).not.toHaveBeenCalled();
    });

    test("skips company profile fetch when getCompany is false", async () => {
      const resp = await getDataFromEntityCookie(mockReq, false);
      expect(resp).toEqual({ [EntityNumberKey]: testEntityNumber });
      expect(mockGetCompanyProfile).not.toHaveBeenCalled();
    });

    test("returns empty object and logs error when an exception is thrown", async () => {
      mockGetCompanyProfile.mockRejectedValue(new Error("service error"));
      const resp = await getDataFromEntityCookie(mockReq);
      expect(resp).toEqual({});
      expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe("saveDataToCookie", () => {

    test("correctly saves a key/value pair to the data cookie", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      saveDataToCookie(mockReq, mockRes, "e_number", testEntityNumber);
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        EntityCookieKey,
        expect.stringContaining(testEntityNumber),
        expect.objectContaining({ httpOnly: true })
      );
    });

    test("merges new key/value into existing cookie data", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      saveDataToCookie(mockReq, mockRes, "new_key", "new_value");
      const calledWith = (mockRes.cookie as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(calledWith);
      expect(parsed[EntityNumberKey]).toBe(testEntityNumber);
      expect(parsed["new_key"]).toBe("new_value");
    });

    test("starts with empty object when no existing cookie is present", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      saveDataToCookie(mockReqNoCookie, mockRes, "e_number", testEntityNumber);
      const calledWith = (mockRes.cookie as jest.Mock).mock.calls[0][1] as string;
      const parsed = JSON.parse(calledWith);
      expect(parsed).toEqual({ e_number: testEntityNumber });
    });

    test("sets correct cookie options including httpOnly, path and domain", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      saveDataToCookie(mockReq, mockRes, "e_number", testEntityNumber);
      const options = (mockRes.cookie as jest.Mock).mock.calls[0][2] as Record<string, unknown>;
      expect(options.httpOnly).toBe(true);
      expect(options).toHaveProperty("domain");
      expect(options).toHaveProperty("path");
      expect(options).toHaveProperty("secure");
    });

    test("logs error and rethrows when res.cookie throws", () => {
      const mockRes = {
        cookie: jest.fn().mockImplementation(() => { throw new Error("cookie error"); }) as any,
      } as Response;
      expect(() => saveDataToCookie(mockReq, mockRes, "e_number", testEntityNumber)).toThrow("cookie error");
      expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeEntityCookie", () => {

    test("sets cookie with maxAge 0 and empty body when cookie exists", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      removeEntityCookie(mockReq, mockRes);
      expect(mockRes.cookie).toHaveBeenCalledTimes(1);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        EntityCookieKey,
        "{}",
        expect.objectContaining({ maxAge: 0, httpOnly: true })
      );
    });

    test("does not set cookie when no entity cookie is present", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      removeEntityCookie(mockReqNoCookie, mockRes);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    test("logs error when res.cookie throws during removal", () => {
      const mockRes = {
        cookie: jest.fn().mockImplementation(() => { throw new Error("removal error"); }) as any,
      } as Response;
      expect(() => removeEntityCookie(mockReq, mockRes)).not.toThrow();
      expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
    });

    test("sets correct cookie options for removal including path and domain", () => {
      const mockRes = {
        cookie: jest.fn() as any,
      } as Response;
      removeEntityCookie(mockReq, mockRes);
      const options = (mockRes.cookie as jest.Mock).mock.calls[0][2] as Record<string, unknown>;
      expect(options.httpOnly).toBe(true);
      expect(options.maxAge).toBe(0);
      expect(options).toHaveProperty("domain");
      expect(options).toHaveProperty("path");
      expect(options).toHaveProperty("secure");
    });
  });
});
