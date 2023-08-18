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

import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { validationResult } from 'express-validator/src/validation-result';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";
import { get, post } from "../../src/controllers/trust.individual.beneficial.owner.controller";
import { INDIVIDUAL_BO_TEXTS } from "../../src/utils/trust.individual.beneficial.owner";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from '../__mocks__/text.mock';
import { authentication } from '../../src/middleware/authentication.middleware';
import { hasTrustWithIdRegister } from '../../src/middleware/navigation/has.trust.middleware';
import { TRUST_ENTRY_URL, TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE, TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL, TRUST_INVOLVED_URL } from '../../src/config';
import { getApplicationData, setExtraData } from '../../src/utils/application.data';
import { TRUST_WITH_ID } from '../__mocks__/session.mock';
import { IndividualTrustee, Trust, TrustKey } from '../../src/model/trust.model';
import { mapCommonTrustDataToPage } from '../../src/utils/trust/common.trust.data.mapper';
import { mapIndividualTrusteeToSession, mapIndividualTrusteeFromSessionToPage } from '../../src/utils/trust/individual.trustee.mapper';
import { getTrustByIdFromApp, saveIndividualTrusteeInTrust, saveTrustInApp } from '../../src/utils/trusts';

import { saveAndContinue } from '../../src/utils/save.and.continue';

const mockSaveAndContinue = saveAndContinue as jest.Mock;

describe('Trust Individual Beneficial Owner Controller', () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = TRUST_ENTRY_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;

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
      headers: {},
      session: {} as Session,
      route: '',
      method: '',
      body: { 'body': 'dummy' }
    } as Request;
  });

  describe('GET unit tests', () => {

    test(`renders the ${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page`, () => {

      const expectMapResult = { dummyKey: 'EXPECT-MAP-RESULT' };
      (mapIndividualTrusteeFromSessionToPage as jest.Mock).mockReturnValueOnce(expectMapResult);
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust1Data);

      get(mockReq, mockRes, mockNext);

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
      const mockTrustee = {} as IndividualTrustee ;
      (mapIndividualTrusteeToSession as jest.Mock).mockReturnValue(mockTrustee);

      mockGetApplicationData.mockReturnValue(mockAppData);

      const mockUpdatedTrust = {} as Trust;
      (saveIndividualTrusteeInTrust as jest.Mock).mockReturnValue(mockTrustee);

      const mockTrust = {} as Trust;
      (getTrustByIdFromApp as jest.Mock).mockReturnValue(mockTrust);

      const mockUpdatedAppData = {} as Trust;
      (saveTrustInApp as jest.Mock).mockReturnValue(mockUpdatedAppData);

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      post(mockReq, mockRes, mockNext);

      expect(mapIndividualTrusteeToSession).toBeCalledTimes(1);
      expect(mapIndividualTrusteeToSession).toBeCalledWith(mockReq.body);

      expect(getTrustByIdFromApp).toBeCalledTimes(1);
      expect(getTrustByIdFromApp).toBeCalledWith(mockAppData, trustId);

      expect(saveIndividualTrusteeInTrust).toBeCalledTimes(1);
      expect(saveIndividualTrusteeInTrust).toBeCalledWith(mockTrust, mockTrustee);

      expect(saveTrustInApp).toBeCalledTimes(1);
      expect(saveTrustInApp).toBeCalledWith(mockAppData, mockUpdatedTrust);

      expect(setExtraData as jest.Mock).toBeCalledWith(
        mockReq.session,
        mockUpdatedAppData,
      );
    });

    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);

      (mapIndividualTrusteeToSession as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      post(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
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

    test('successfully access POST method', async () => {

      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      const resp = await request(app).post(pageUrl).send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_ENTRY_URL}/${trustId}${TRUST_INVOLVED_URL}`);

      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdRegister).toBeCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });
});
