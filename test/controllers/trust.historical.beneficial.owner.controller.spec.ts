jest.mock("ioredis");
jest.mock("../../src/utils/application.data");
jest.mock('../../src/utils/trust/historical.beneficial.owner.mapper');
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));
jest.mock('../../src/utils/trusts');

import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";
import { get, HISTORICAL_BO_TEXTS, post } from "../../src/controllers/trust.historical.beneficial.owner.controller";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from '../__mocks__/text.mock';
import { authentication } from '../../src/middleware/authentication.middleware';
import { hasTrust } from '../../src/middleware/navigation/has.trust.middleware';
import { TRUST_ENTRY_URL, TRUST_HISTORICAL_BENEFICIAL_OWNER_URL, TRUST_INVOLVED_URL } from '../../src/config';
import { Trust, TrustHistoricalBeneficialOwner, TrustKey } from '../../src/model/trust.model';
import { getApplicationData, setExtraData } from '../../src/utils/application.data';
import { getTrustByIdFromApp, saveHistoricalBoInTrust, saveTrustInApp } from '../../src/utils/trusts';
import { mapBeneficialOwnerToSession, mapTrustToPage } from '../../src/utils/trust/historical.beneficial.owner.mapper';

describe('Trust Historical Beneficial Owner Controller', () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = '99999';
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_HISTORICAL_BENEFICIAL_OWNER_URL;

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

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(expect.stringContaining(`${trustId}${TRUST_INVOLVED_URL}`));
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
      (hasTrust as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test('successfully access GET method and render', async () => {
      const mockTrust = {
        trustName: 'dummyName',
      };
      (mapTrustToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(pageUrl);

      expect(resp.text).toContain(mockTrust.trustName);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(HISTORICAL_BO_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      const resp = await request(app).post(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrust).toBeCalledTimes(1);
    });
  });
});
