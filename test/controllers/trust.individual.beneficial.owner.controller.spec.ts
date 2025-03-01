jest.mock("ioredis");
jest.mock('express-validator/src/validation-result');
jest.mock("../../src/utils/application.data");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/trusts');
jest.mock('../../src/utils/trust/common.trust.data.mapper');
jest.mock('../../src/utils/trust/individual.trustee.mapper');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/url');
jest.mock('../../src/middleware/service.availability.middleware');
jest.mock('../../src/service/overseas.entities.service');

import { NextFunction, Request, Response } from "express";
import { constants } from 'http2';
import { Params } from 'express-serve-static-core';
import { validationResult } from 'express-validator/src/validation-result';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";

import mockCsrfProtectionMiddleware from "../__mocks__/csrfProtectionMiddleware.mock";
import app from "../../src/app";

import { INDIVIDUAL_BO_TEXTS } from "../../src/utils/trust.individual.beneficial.owner";
import { authentication } from '../../src/middleware/authentication.middleware';
import { hasTrustWithIdRegister } from '../../src/middleware/navigation/has.trust.middleware';
import { mapCommonTrustDataToPage } from '../../src/utils/trust/common.trust.data.mapper';
import { saveAndContinue } from '../../src/utils/save.and.continue';
import { isActiveFeature } from '../../src/utils/feature.flag';
import { getUrlWithParamsToPath, isRegistrationJourney } from '../../src/utils/url';
import { serviceAvailabilityMiddleware } from '../../src/middleware/service.availability.middleware';
import { updateOverseasEntity } from "../../src/service/overseas.entities.service";

import { get, post } from "../../src/controllers/trust.individual.beneficial.owner.controller";
import { fetchApplicationData, setExtraData } from '../../src/utils/application.data';
import { IndividualTrustee, Trust, TrustKey } from '../../src/model/trust.model';

import {
  mapIndividualTrusteeToSession,
  mapIndividualTrusteeByIdFromSessionToPage
} from '../../src/utils/trust/individual.trustee.mapper';

import {
  getTrustByIdFromApp,
  saveIndividualTrusteeInTrust,
  saveTrustInApp
} from '../../src/utils/trusts';

import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR
} from '../__mocks__/text.mock';

import {
  APPLICATION_DATA_MOCK,
  TRUST_WITH_ID
} from '../__mocks__/session.mock';

import {
  TRUST_ENTRY_URL,
  TRUST_ENTRY_WITH_PARAMS_URL,
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
  TRUST_INVOLVED_URL
} from '../../src/config';

mockCsrfProtectionMiddleware.mockClear();
const MOCKED_URL = TRUST_ENTRY_WITH_PARAMS_URL + "MOCKED_URL";
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

const mockUpdateOverseasEntity = updateOverseasEntity as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(true);

describe('Trust Individual Beneficial Owner Controller', () => {

  const mockFetchApplicationData = fetchApplicationData as jest.Mock;
  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;
  const mockNext = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();
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
      route: '',
      method: '',
      body: { 'body': 'dummy' },
      query: {}
    } as Request;
  });

  describe('GET unit tests', () => {

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page`, async () => {
      const expectMapResult = { dummyKey: 'EXPECT-MAP-RESULT' };
      (mapIndividualTrusteeByIdFromSessionToPage as jest.Mock).mockReturnValueOnce(expectMapResult);
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust1Data);
      mockIsActiveFeature.mockReturnValueOnce(true);
      mockReq.query = { "relevant-period": "true" };
      mockFetchApplicationData.mockReturnValue(mockAppData);

      await get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
        expect.objectContaining({
          pageData: expect.objectContaining({
            trustData: mockTrust1Data,
          }),
          formData: expectMapResult
        }),
      );
    });

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockFetchApplicationData.mockImplementationOnce(() => { throw error; });
      await get(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {

    test('Save with the REDIS_removal flag set to OFF', async () => {
      const mockTrustee = {} as IndividualTrustee ;
      (mapIndividualTrusteeToSession as jest.Mock).mockReturnValue(mockTrustee);

      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockIsActiveFeature.mockReturnValue(false);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);

      const mockUpdatedTrust = {} as Trust;
      (saveIndividualTrusteeInTrust as jest.Mock).mockReturnValue(mockTrustee);

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const mockUpdatedAppData = {} as Trust;
      (saveTrustInApp as jest.Mock).mockReturnValue(mockUpdatedAppData);

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      await post(mockReq, mockRes, mockNext);

      expect(mapIndividualTrusteeToSession).toBeCalledTimes(1);
      expect(mapIndividualTrusteeToSession).toBeCalledWith(mockReq.body);
      expect(getTrustByIdFromApp).toBeCalledTimes(1);
      expect(getTrustByIdFromApp).toBeCalledWith(mockAppData, trustId);
      expect(saveIndividualTrusteeInTrust).toBeCalledTimes(1);
      expect(saveIndividualTrusteeInTrust).toBeCalledWith(mockTrust, mockTrustee);
      expect(saveTrustInApp).toBeCalledTimes(1);
      expect(saveTrustInApp).toBeCalledWith(mockAppData, mockUpdatedTrust);
      expect(setExtraData as jest.Mock).toBeCalledWith(mockReq.session, mockUpdatedAppData,);
      expect(mockUpdateOverseasEntity).not.toHaveBeenCalled();
    });

    test('Save with the REDIS_removal flag set to ON', async () => {
      const mockTrustee = {} as IndividualTrustee ;
      (mapIndividualTrusteeToSession as jest.Mock).mockReturnValue(mockTrustee);

      mockFetchApplicationData.mockReturnValue(mockAppData);
      mockIsActiveFeature.mockReturnValue(true);
      mockUpdateOverseasEntity.mockReturnValueOnce(true);

      const mockUpdatedTrust = {} as Trust;
      (saveIndividualTrusteeInTrust as jest.Mock).mockReturnValue(mockTrustee);

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const mockUpdatedAppData = {} as Trust;
      (saveTrustInApp as jest.Mock).mockReturnValue(mockUpdatedAppData);

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      await post(mockReq, mockRes, mockNext);

      expect(mapIndividualTrusteeToSession).toBeCalledTimes(1);
      expect(mapIndividualTrusteeToSession).toBeCalledWith(mockReq.body);
      expect(getTrustByIdFromApp).toBeCalledTimes(1);
      expect(getTrustByIdFromApp).toBeCalledWith(mockAppData, trustId);
      expect(saveIndividualTrusteeInTrust).toBeCalledTimes(1);
      expect(saveIndividualTrusteeInTrust).toBeCalledWith(mockTrust, mockTrustee);
      expect(saveTrustInApp).toBeCalledTimes(1);
      expect(saveTrustInApp).toBeCalledWith(mockAppData, mockUpdatedTrust);
      expect(setExtraData as jest.Mock).toBeCalledWith(mockReq.session, mockUpdatedAppData,);
      expect(mockUpdateOverseasEntity).toHaveBeenCalledTimes(1);
    });

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mapIndividualTrusteeToSession as jest.Mock).mockImplementationOnce(() => { throw error; });
      await post(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('no selection to add trust with url params - render with errors', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockReq.url = "/register-an-overseas-entity/transaction/123/submission/456/trusts/trust-individual-beneficial-owner";
      mockReq.body = {};
      await post(mockReq, mockRes, mockNext);
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });

    test('no selection to add trust with url no params - render with errors', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));
      mockFetchApplicationData.mockReturnValueOnce(APPLICATION_DATA_MOCK);
      mockReq.url = "/register-an-overseas-entity/trusts/trust-individual-beneficial-owner";
      mockReq.body = {};
      await post(mockReq, mockRes, mockNext);
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockSaveAndContinue).not.toHaveBeenCalled();
    });
  });

  describe('Endpoint Access tests with supertest', () => {

    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      const mockTrust = {
        trustName: 'dummyName',
      };

      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(pageUrl);
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(INDIVIDUAL_BO_TEXTS.title);
      expect(resp.text).toContain(mockTrust.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    /**
    * not sure what this test achieves, needs more investigation (all the other POST tests "successfully access POST method")
    */
    test.skip('successfully access POST method', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));
      const mockTrust = {
        trustName: 'dummyName',
      };

      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);
      const resp = await request(app).post(pageUrl).send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Endpoint Access tests with supertest with url params', () => {

    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      const mockTrust = {
        trustName: 'dummyName',
      };

      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(TRUST_ENTRY_WITH_PARAMS_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL);
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(INDIVIDUAL_BO_TEXTS.title);
      expect(resp.text).toContain(mockTrust.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    /**
     * not sure what this test achieves, needs more investigation (all the other POST tests "successfully access POST method")
     */
    test.skip('successfully access POST method', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);

      const resp = await request(app).post(TRUST_ENTRY_WITH_PARAMS_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL).send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${MOCKED_URL}/${trustId}${TRUST_INVOLVED_URL}`);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
    });
  });
});
