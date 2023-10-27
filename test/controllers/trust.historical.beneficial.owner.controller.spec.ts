jest.mock("ioredis");
jest.mock("../../src/utils/application.data");
jest.mock('../../src/utils/trust/historical.beneficial.owner.mapper');
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/utils/save.and.continue');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/trusts');
jest.mock('../../src/utils/trust/common.trust.data.mapper');
jest.mock('../../src/utils/feature.flag');
jest.mock('../../src/utils/url');
jest.mock('../../src/middleware/service.availability.middleware');

import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";
import { get, post } from "../../src/controllers/trust.historical.beneficial.owner.controller";
import { HISTORICAL_BO_TEXTS } from '../../src/utils/trust.former.bo';
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from '../__mocks__/text.mock';
import { ErrorMessages } from '../../src/validation/error.messages';
import { authentication } from '../../src/middleware/authentication.middleware';
import { hasTrustWithIdRegister } from '../../src/middleware/navigation/has.trust.middleware';
import {
  TRUST_ENTRY_URL,
  TRUST_ENTRY_WITH_PARAMS_URL,
  TRUST_HISTORICAL_BENEFICIAL_OWNER_URL,
  TRUST_INVOLVED_URL
} from '../../src/config';
import { Trust, TrustHistoricalBeneficialOwner, TrustKey } from '../../src/model/trust.model';
import { getApplicationData, setExtraData } from '../../src/utils/application.data';
import { getTrustByIdFromApp, saveHistoricalBoInTrust, saveTrustInApp } from '../../src/utils/trusts';
import { mapBeneficialOwnerToSession } from '../../src/utils/trust/historical.beneficial.owner.mapper';
import { mapCommonTrustDataToPage } from '../../src/utils/trust/common.trust.data.mapper';
import { isActiveFeature } from '../../src/utils/feature.flag';
import { getUrlWithParamsToPath } from '../../src/utils/url';
import { serviceAvailabilityMiddleware } from '../../src/middleware/service.availability.middleware';

const MOCKED_URL = TRUST_ENTRY_WITH_PARAMS_URL + "MOCKED_URL";
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetUrlWithParamsToPath = getUrlWithParamsToPath as jest.Mock;

const mockServiceAvailabilityMiddleware = serviceAvailabilityMiddleware as jest.Mock;
mockServiceAvailabilityMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next() );

describe('Trust Historical Beneficial Owner Controller', () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = '99999';
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;
  const pageWithParamsUrl = TRUST_ENTRY_WITH_PARAMS_URL + "/" + trustId + TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;

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

  const mockHistBORequest = {
    type: "legalEntity",
    corporate_name: "Lacotto",
    startDateDay: "16",
    startDateMonth: "4",
    startDateYear: "2023",
    endDateDay: "17",
    endDateMonth: "3",
    endDateYear: "2023"
  };

  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

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
    } as Request;
  });

  describe('GET unit tests', () => {
    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      mockGetApplicationData.mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {
    test('Save', () => {
      const mockBoData = {} as TrustHistoricalBeneficialOwner;
      (mapBeneficialOwnerToSession as jest.Mock).mockReturnValue(mockBoData);

      mockGetApplicationData.mockReturnValue(mockAppData);

      const mockUpdatedTrust = {} as Trust;
      (saveHistoricalBoInTrust as jest.Mock).mockReturnValue(mockBoData);

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const mockUpdatedAppData = {} as Trust;
      (saveTrustInApp as jest.Mock).mockReturnValue(mockUpdatedAppData);

      post(mockReq, mockRes, mockNext);

      expect(mapBeneficialOwnerToSession).toBeCalledTimes(1);
      expect(mapBeneficialOwnerToSession).toBeCalledWith(mockReq.body);

      expect(getTrustByIdFromApp).toBeCalledTimes(1);
      expect(getTrustByIdFromApp).toBeCalledWith(mockAppData, trustId);

      expect(saveHistoricalBoInTrust).toBeCalledTimes(1);
      expect(saveHistoricalBoInTrust).toBeCalledWith(mockTrust, mockBoData);

      expect(saveTrustInApp).toBeCalledTimes(1);
      expect(saveTrustInApp).toBeCalledWith(mockAppData, mockUpdatedTrust);

      expect(setExtraData as jest.Mock).toBeCalledWith(
        mockReq.session,
        mockUpdatedAppData,
      );
    });

    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mapBeneficialOwnerToSession as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('Endpoint Access tests', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test('successfully access GET method and render', async () => {
      const mockTrust = {
        trustName: 'dummyName',
      };
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(pageUrl);

      expect(resp.text).toContain(mockTrust.trustName);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      const resp = await request(app).post(pageUrl).send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    test('renders the current page with error messages', async () => {
      const resp = await request(app).post(pageUrl).send(mockHistBORequest);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.TRUST_CEASED_DATE_BEFORE_START_DATE);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });
  });

  describe('Endpoint Access with params tests', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrustWithIdRegister as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test('successfully access GET method and render', async () => {
      const mockTrust = {
        trustName: 'dummyName',
      };
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(pageWithParamsUrl);

      expect(resp.text).toContain(mockTrust.trustName);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      mockIsActiveFeature.mockReturnValueOnce(true); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
      mockGetUrlWithParamsToPath.mockReturnValueOnce(MOCKED_URL);
      const resp = await request(app).post(pageWithParamsUrl).send({});
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
      expect(mockGetUrlWithParamsToPath).toHaveBeenCalledTimes(1);
      expect(mockGetUrlWithParamsToPath.mock.calls[0][0]).toEqual(TRUST_ENTRY_WITH_PARAMS_URL);
      expect(resp.text).toContain(MOCKED_URL + `/${trustId}${TRUST_INVOLVED_URL}`); // back link
    });

    test('renders the current page with error messages', async () => {
      const resp = await request(app).post(pageWithParamsUrl).send(mockHistBORequest);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.TRUST_CEASED_DATE_BEFORE_START_DATE);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
    });
  });
});
