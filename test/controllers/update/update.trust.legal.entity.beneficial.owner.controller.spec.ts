jest.mock("ioredis");
jest.mock('express-validator/src/validation-result');
jest.mock("../../../src/utils/application.data");
jest.mock("../../../src/middleware/authentication.middleware");
jest.mock("../../../src/middleware/navigation/has.trust.middleware");
jest.mock('../../../src/utils/save.and.continue');
jest.mock("../../../src/utils/trusts");
jest.mock("../../../src/utils/trust/common.trust.data.mapper");
jest.mock("../../../src/utils/trust/legal.entity.beneficial.owner.mapper");
jest.mock("../../../src/middleware/validation.middleware");
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/service/overseas.entities.service');
jest.mock('../../../src/utils/save.and.continue');
jest.mock("../../../src/utils/url");

import { NextFunction, Request, Response } from "express";
import { Params } from "express-serve-static-core";
import { constants } from "http2";
import request from "supertest";
import { Session } from "@companieshouse/node-session-handler";
import { validationResult } from 'express-validator/src/validation-result';

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import app from "../../../src/app";

import { authentication } from "../../../src/middleware/authentication.middleware";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { saveAndContinue } from "../../../src/utils/save.and.continue";
import { RoleWithinTrustType } from "../../../src/model/role.within.trust.type.model";
import { hasUpdatePresenter } from "../../../src/middleware/navigation/update/has.presenter.middleware";
import { updateOverseasEntity } from "../../../src/service/overseas.entities.service";
import { hasTrustWithIdUpdate } from "../../../src/middleware/navigation/has.trust.middleware";
import { companyAuthentication } from "../../../src/middleware/company.authentication.middleware";
import { LEGAL_ENTITY_BO_TEXTS } from "../../../src/utils/trust.legal.entity.bo";
import { mapCommonTrustDataToPage } from "../../../src/utils/trust/common.trust.data.mapper";
import { serviceAvailabilityMiddleware } from "../../../src/middleware/service.availability.middleware";

import { get, post, } from "../../../src/controllers/update/update.trusts.legal.entity.beneficial.owner.controller";
import { APPLICATION_DATA_MOCK, OVERSEAS_ENTITY_ID } from "../../__mocks__/session.mock";

import {
  getRedirectUrl,
  isRemoveJourney,
  isRegistrationJourney,
} from "../../../src/utils/url";

import {
  Trust,
  TrustKey,
  TrustCorporate,
} from "../../../src/model/trust.model";

import {
  setExtraData,
  getApplicationData,
  fetchApplicationData,
} from "../../../src/utils/application.data";

import {
  PAGE_TITLE_ERROR,
  ANY_MESSAGE_ERROR,
  IMPORTANT_BANNER_TEXT,
  TRUSTEE_STILL_INVOLVED_TEXT,
} from "../../__mocks__/text.mock";

import {
  TRUST_INVOLVED_URL,
  TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
} from "../../../src/config";

import {
  saveTrustInApp,
  getTrustByIdFromApp,
  saveLegalEntityBoInTrust,
} from "../../../src/utils/trusts";

import {
  mapLegalEntityToSession,
  mapLegalEntityTrusteeByIdFromSessionToPage
} from "../../../src/utils/trust/legal.entity.beneficial.owner.mapper";

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;
const mockGetRedirectUrl = getRedirectUrl as jest.Mock;

const mockAuthentication = (authentication as jest.Mock);
mockAuthentication.mockImplementation((_, __, next: NextFunction) => next());

const mockCompanyAuthentication = (companyAuthentication as jest.Mock);
mockCompanyAuthentication.mockImplementation((_, __, next: NextFunction) => next());

const mockHasUpdatePresenter = (hasUpdatePresenter as jest.Mock);
mockHasUpdatePresenter.mockImplementation((_, __, next: NextFunction) => next());

const mockHasTrustWithIdUpdate = (hasTrustWithIdUpdate as jest.Mock);
mockHasTrustWithIdUpdate.mockImplementation((_, __, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = (serviceAvailabilityMiddleware as jest.Mock);
mockServiceAvailabilityMiddleware.mockImplementation((_, __, next: NextFunction) => next());

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(false);

const mockIsRemoveJourney = isRemoveJourney as jest.Mock;
mockIsRemoveJourney.mockReturnValue(false);

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;
mockUpdateOverseasEntity.mockReturnValue(OVERSEAS_ENTITY_ID);

const mockSaveAndContinue = saveAndContinue as jest.Mock;
mockSaveAndContinue.mockReturnValue(true);

describe('Trust Legal Entity Beneficial Owner Controller', () => {

  const trustId = '99999';
  const pageUrl = UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL + "/" + trustId + TRUST_LEGAL_ENTITY_BENEFICIAL_OWNER_URL;

  const mockTrust1Data = {
    trust_id: '999',
    trust_name: 'dummyTrustName1',
  } as Trust;

  const mockTrust2Data = {
    trust_id: '802',
    trust_name: 'dummyTrustName2',
  } as Trust;

  const mockTrust3Data = {
    trust_id: '803',
    trust_name: 'dummyTrustName3',
  } as Trust;

  let mockAppData = {};

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();
  const mockRelevantPeriodNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchApplicationData.mockReset();
    mockGetApplicationData.mockReset();
    mockIsActiveFeature.mockReturnValue(true);
    mockGetRedirectUrl.mockReset();

    mockAppData = {
      [TrustKey]: [
        mockTrust1Data,
        mockTrust2Data,
        mockTrust3Data,
      ],
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

  describe('GET unit tests', () => {

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockFetchApplicationData.mockImplementation(() => { throw error; });
      await get(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('execute render outwith the relevant period', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mapLegalEntityToSession as jest.Mock).mockImplementation(() => { throw error; });
      get(mockReq, mockRes, mockRelevantPeriodNext);
      expect(mockRelevantPeriodNext).not.toBeCalled();
    });
  });

  describe('POST unit tests', () => {

    test('Save when REDIS_flag is set to OFF', async () => {
      const mockBoData = {} as TrustCorporate;
      const mockUpdatedTrust = {} as Trust;
      const mockUpdatedAppData = {} as Trust;
      const mockTrust = {} as Trust;

      (mapLegalEntityToSession as jest.Mock).mockReturnValue(mockBoData);
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockIsActiveFeature.mockReturnValue(false);
      (saveLegalEntityBoInTrust as jest.Mock).mockReturnValue(mockBoData);
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
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
        mockUpdatedAppData,
      );
      expect(mockSaveAndContinue).toBeCalled();
      expect(mockUpdateOverseasEntity).not.toBeCalled();
    });

    test('Save when REDIS_flag is set to ON', async () => {
      const mockBoData = {} as TrustCorporate;
      const mockUpdatedTrust = {} as Trust;
      const mockUpdatedAppData = {} as Trust;
      const mockTrust = {} as Trust;

      (mapLegalEntityToSession as jest.Mock).mockReturnValue(mockBoData);
      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockIsActiveFeature.mockReturnValue(true);
      (saveLegalEntityBoInTrust as jest.Mock).mockReturnValue(mockBoData);
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);
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
        mockUpdatedAppData,
      );
      expect(mockSaveAndContinue).not.toBeCalled();
      expect(mockUpdateOverseasEntity).toBeCalled();
    });

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mapLegalEntityToSession as jest.Mock).mockImplementationOnce(() => { throw error; });
      await post(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('Endpoint Access tests', () => {

    test('successfully access GET method and render', async () => {
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue({ trustName: 'dummyName' });

      const resp = await request(app).get(pageUrl);

      expect(resp.text).toContain('dummyName');
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(LEGAL_ENTITY_BO_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(TRUSTEE_STILL_INVOLVED_TEXT);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });

    test('successfully access GET method and render', async () => {
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue({ trustName: 'dummyName' });
      (mapLegalEntityTrusteeByIdFromSessionToPage as jest.Mock).mockReturnValue({});
      mockGetApplicationData.mockReturnValue(mockAppData);
      mockFetchApplicationData.mockReturnValue(mockAppData);

      const resp = await request(app).get(pageUrl + "?relevant-period=true").send({ relevant_period: true });

      expect(resp.text).toContain('dummyName');
      expect(resp.text).toContain(IMPORTANT_BANNER_TEXT);
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(LEGAL_ENTITY_BO_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(TRUSTEE_STILL_INVOLVED_TEXT);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      mockIsActiveFeature.mockReturnValue(false);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);
      mockGetRedirectUrl.mockReturnValue(`${UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}`);

      (validationResult as any as jest.Mock).mockImplementation(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      const resp = await request(app).post(pageUrl).send({ stillInvolved: '1', });

      expect(setExtraData as jest.Mock).toBeCalled();
      expect(mockSaveAndContinue).toBeCalled();
      expect(mockUpdateOverseasEntity).not.toBeCalled();
      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(
        `${UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${trustId}${TRUST_INVOLVED_URL}`
      );
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });
  });
});
