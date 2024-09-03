jest.mock("ioredis");
jest.mock("../../../src/utils/application.data");
jest.mock('../../../src/utils/trust/historical.beneficial.owner.mapper');
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/utils/trusts');
jest.mock('../../../src/utils/trust/common.trust.data.mapper');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../../src/app";
import { get, post } from "../../../src/controllers/trust.historical.beneficial.owner.controller";
import { HISTORICAL_BO_TEXTS } from '../../../src/utils/trust.former.bo';
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from '../../__mocks__/text.mock';
import { authentication } from '../../../src/middleware/authentication.middleware';
import { hasTrustWithIdUpdate } from '../../../src/middleware/navigation/has.trust.middleware';
import { UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL, TRUST_HISTORICAL_BENEFICIAL_OWNER_URL } from '../../../src/config';
import { Trust, TrustHistoricalBeneficialOwner, TrustKey } from '../../../src/model/trust.model';
import { getApplicationData, setExtraData } from '../../../src/utils/application.data';
import { getTrustByIdFromApp, saveHistoricalBoInTrust, saveTrustInApp } from '../../../src/utils/trusts';
import { mapBeneficialOwnerToSession } from '../../../src/utils/trust/historical.beneficial.owner.mapper';
import { mapCommonTrustDataToPage } from '../../../src/utils/trust/common.trust.data.mapper';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { hasUpdatePresenter } from '../../../src/middleware/navigation/update/has.presenter.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { ErrorMessages } from '../../../src/validation/error.messages';

mockCsrfProtectionMiddleware.mockClear();
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockGetApplicationData = getApplicationData as jest.Mock;

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

describe('Trust Historical Beneficial Owner Controller', () => {
  const trustId = '99999';
  const pageUrl = UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL + "/" + trustId + TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;

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

  const mockHistBORequest = {
    type: "legalEntity",
    ch_reference: "erhgdfhd",
    corporate_name: "Lacotto",
    startDateDay: "16",
    startDateMonth: "9",
    startDateYear: "2023",
    endDateDay: "17",
    endDateMonth: "8",
    endDateYear: "2023"
  };

  let mockAppData = {};

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockIsActiveFeature.mockReturnValue(true);

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
      mockGetApplicationData.mockImplementationOnce(() => { throw error; });

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

    test('renders the current page with error messages for start and ceased date must be on or before filing date', async () => {

      mockAppData = {
        update: {
          "filing_date": {
            "day": "16",
            "month": "6",
            "year": "2000"
          }
        }
      };

      mockReq = {
        session: {} as Session,
        headers: {},
        route: '',
        method: '',
        body: {},
      } as Request;

      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

      const resp = await request(app).post(pageUrl).send(mockHistBORequest);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(ErrorMessages.START_DATE_BEFORE_FILING_DATE);
      expect(resp.text).toContain(ErrorMessages.CEASED_DATE_BEFORE_FILING_DATE);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });

    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mapBeneficialOwnerToSession as jest.Mock).mockImplementationOnce(() => { throw error; });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });

    test('successfully access POST method without CeasedDate and StartDate errors', async () => {
      mockAppData = {
        update: {
          "filing_date": {
            "day": "16",
            "month": "12",
            "year": "2023"
          }
        }
      };

      mockReq = {
        session: {} as Session,
        headers: {},
        route: '',
        method: '',
        body: {},
      } as Request;

      (getApplicationData as jest.Mock).mockReturnValue(mockAppData);

      const resp = await request(app).post(pageUrl).send(mockHistBORequest);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);
      expect(resp.text).not.toContain(ErrorMessages.START_DATE_BEFORE_FILING_DATE);
      expect(resp.text).not.toContain(ErrorMessages.CEASED_DATE_BEFORE_FILING_DATE);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });
  });

  describe('Endpoint Access tests', () => {
    test('successfully access GET method and render', async () => {
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue({ trustName: 'dummyName' });

      const resp = await request(app).get(pageUrl);

      expect(resp.text).toContain('dummyName');

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      const resp = await request(app).post(pageUrl).send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });
  });
});
