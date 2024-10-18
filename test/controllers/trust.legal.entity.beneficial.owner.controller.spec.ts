jest.mock("ioredis");
jest.mock('express-validator/src/validation-result');
jest.mock(".../../../src/utils/application.data");
jest.mock("../../src/middleware/authentication.middleware");
jest.mock("../../src/middleware/navigation/has.trust.middleware");
jest.mock('../../src/utils/save.and.continue');
jest.mock("../../src/middleware/is.feature.enabled.middleware", () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock("../../src/utils/trusts");
jest.mock("../../src/utils/trust/common.trust.data.mapper");
jest.mock("../../src/utils/trust/legal.entity.beneficial.owner.mapper");
jest.mock("../../src/middleware/validation.middleware");
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock('../../src/utils/url');

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import { constants } from "http2";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextFunction, Request, Response } from "express";
import { Params } from "express-serve-static-core";
import { validationResult } from 'express-validator/src/validation-result';
import { Session } from "@companieshouse/node-session-handler";
import request from "supertest";
import app from "../../src/app";
import {
  get,
  post,
} from "../../src/controllers/trust.legal.entity.beneficial.owner.controller";
import { LEGAL_ENTITY_BO_TEXTS } from "../../src/utils/trust.legal.entity.bo";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from "../__mocks__/text.mock";
import { authentication } from "../../src/middleware/authentication.middleware";
import { hasTrustWithIdRegister } from "../../src/middleware/navigation/has.trust.middleware";
import {
  TRUST_ENTRY_URL,
  TRUST_ENTRY_WITH_PARAMS_URL,
  TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
  TRUST_INVOLVED_URL,
} from "../../src/config";
import { Trust, TrustCorporate, TrustKey } from "../../src/model/trust.model";
import {
  getApplicationData,
  setExtraData,
} from "../../src/utils/application.data";
import {
  getTrustByIdFromApp,
  saveLegalEntityBoInTrust,
  saveTrustInApp,
} from "../../src/utils/trusts";
import { mapCommonTrustDataToPage } from "../../src/utils/trust/common.trust.data.mapper";
import { mapLegalEntityToSession } from "../../src/utils/trust/legal.entity.beneficial.owner.mapper";
import { saveAndContinue } from '../../src/utils/save.and.continue';
import { RoleWithinTrustType } from "../../src/model/role.within.trust.type.model";
import { formatValidationError } from "../../src/middleware/validation.middleware";
import { isActiveFeature } from '../../src/utils/feature.flag';
import { serviceAvailabilityMiddleware } from '../../src/middleware/service.availability.middleware';
import { getUrlWithParamsToPath } from '../../src/utils/url';
import { APPLICATION_DATA_MOCK } from "../__mocks__/session.mock";

mockCsrfProtectionMiddleware.mockClear();
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const MOCKED_URL = TRUST_ENTRY_WITH_PARAMS_URL + "MOCKED_URL";
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe("Trust Legal Entity Beneficial Owner Controller", () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = "999999";
  const pageUrl =
    TRUST_ENTRY_URL + "/" + trustId + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;
  const pageUrlWithParams =
    TRUST_ENTRY_WITH_PARAMS_URL + "/" + trustId + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;

  const mockTrust1Data = {
    trust_id: "999",
    trust_name: "dummyTrustName1",
  } as Trust;

  const mockTrust2Data = {
    trust_id: "802",
    trust_name: "dummyTrustName2",
  } as Trust;

  const mockTrust3Data = {
    trust_id: "803",
    trust_name: "dummyTrustName3",
  } as Trust;

  let mockAppData = {};

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockAppData = {
      [TrustKey]: [mockTrust1Data, mockTrust2Data, mockTrust3Data],
    };

    mockReq = {
      params: {
        trustId: trustId,
      } as Params,
      headers: {},
      session: {} as Session,
      route: "",
      method: "",
      body: {
        legalEntityId: "001",
        legalEntityName: "Ambosia",
        roleWithinTrust: RoleWithinTrustType.INTERESTED_PERSON,
        interestedPersonStartDateDay: "12",
        interestedPersonStartDateMonth: "12",
        interestedPersonStartDateYear: "2001",
        principal_address_property_name_number: "12",
        principal_address_line_1: "Ever green",
        principal_address_line_2: "Forest road",
        principal_address_town: "Amazon",
        principal_address_county: "Ozia",
        principal_address_country: "Oz",
        principal_address_postcode: "12 F",
        service_address_property_name_number: "12",
        service_address_line_1: "Slippery slope",
        service_address_line_2: "Hill",
        service_address_town: "Starway",
        service_address_county: "Milkyway",
        service_address_country: "Galactica",
        service_address_postcode: "12F",
        governingLaw: "Law",
        legalForm: "Form",
        public_register_name: "Clause",
        public_register_jurisdiction: "xxx",
        registration_number: "1234",
        is_service_address_same_as_principal_address: "0",
        is_on_register_in_country_formed_in: "0",
      },
    } as Request;
  });

  describe("GET unit tests", () => {
    test("catch error when renders the page", async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => {
        throw error;
      });

      await get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe("POST unit tests", () => {
    test("Save", async () => {
      const mockBoData = {} as TrustCorporate;
      (mapLegalEntityToSession as jest.Mock).mockReturnValue(mockBoData);

      mockGetApplicationData.mockReturnValue(mockAppData);

      const mockUpdatedTrust = {} as Trust;
      (saveLegalEntityBoInTrust as jest.Mock).mockReturnValue(mockBoData);

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const mockUpdatedAppData = {} as Trust;
      (saveTrustInApp as jest.Mock).mockReturnValue(mockUpdatedAppData);

      (validationResult as any as jest.Mock).mockImplementation(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      await post(mockReq, mockRes, mockNext);

      expect(mapLegalEntityToSession).toBeCalledTimes(1);
      expect(mapLegalEntityToSession).toBeCalledWith(mockReq.body);

      expect(getTrustByIdFromApp).toBeCalledTimes(1);
      expect(getTrustByIdFromApp).toBeCalledWith(mockAppData, trustId);

      expect(saveLegalEntityBoInTrust).toBeCalledTimes(1);
      expect(saveLegalEntityBoInTrust).toBeCalledWith(mockTrust, mockBoData);

      expect(saveTrustInApp).toBeCalledTimes(1);
      expect(saveTrustInApp).toBeCalledWith(mockAppData, mockUpdatedTrust);

      expect(setExtraData as jest.Mock).toBeCalledWith(
        mockReq.session,
        mockUpdatedAppData
      );
    });

    test("catch error on post", async () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mapLegalEntityToSession as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      await post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('no selection to add trust with url params - render with errors', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      mockReq.url = "/register-an-overseas-entity/transaction/123/submission/456/trusts/trust-legal-entity-beneficial-owner";
      mockReq.body = {};

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test('no selection to add trust with url no params - render with errors', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));
      mockGetApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);

      mockReq.url = "/register-an-overseas-entity/trusts/trust-legal-entity-beneficial-owner";
      mockReq.body = {};

      await post(mockReq, mockRes, mockNext);

      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });

  describe("Endpoint Access tests with supertest", () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation(
        (_, __, next: NextFunction) => next()
      );
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) =>
        next()
      );
    });

    test(`successfully access GET method`, async () => {
      const mockTrust = {
        trustName: "dummyName",
      };
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(LEGAL_ENTITY_BO_TEXTS.title);
      expect(resp.text).toContain(mockTrust.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    test("successfully access POST method", async () => {
      const resp = await request(app).post(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(
        `${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`
      );

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });

    test("should have validation error", async () => {
      (validationResult as unknown as jest.Mock).mockImplementation(() => ({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ test: 'error' }])
      }));
      formatValidationError as jest.Mock;

      const resp = await (await request(app).post(pageUrl).send(mockReq));

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });
  });

  describe("Endpoint Access tests with supertest with url params", () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation(
        (_, __, next: NextFunction) => next()
      );
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) =>
        next()
      );
    });

    test(`successfully access GET method`, async () => {
      const mockTrust = {
        trustName: "dummyName",
      };
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      const resp = await request(app).get(pageUrlWithParams);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(LEGAL_ENTITY_BO_TEXTS.title);
      expect(resp.text).toContain(mockTrust.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    test("successfully access POST method", async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);

      const resp = await request(app).post(pageUrlWithParams);

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${MOCKED_URL}/${trustId}${TRUST_INVOLVED_URL}`);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
    });

    test("should have validation error", async () => {
      (validationResult as unknown as jest.Mock).mockImplementation(() => ({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ test: 'error' }])
      }));
      formatValidationError as jest.Mock;

      const resp = await (await request(app).post(pageUrlWithParams).send(mockReq));

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });
  });
});
