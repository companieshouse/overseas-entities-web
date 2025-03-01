jest.mock("ioredis");
jest.mock('express-validator/src/validation-result');
jest.mock("../../../src/utils/application.data");
jest.mock('../../../src/middleware/authentication.middleware');
jest.mock('../../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../../src/utils/save.and.continue');
jest.mock('../../../src/utils/trusts');
jest.mock('../../../src/utils/trust/common.trust.data.mapper');
jest.mock('../../../src/utils/trust/individual.trustee.mapper');
jest.mock('../../../src/utils/feature.flag');
jest.mock('../../../src/middleware/company.authentication.middleware');
jest.mock('../../../src/middleware/navigation/update/has.presenter.middleware');
jest.mock('../../../src/middleware/service.availability.middleware');
jest.mock('../../../src/utils/relevant.period');
jest.mock('../../../src/utils/url');

import { NextFunction, Request, Response } from "express";
import { constants } from 'http2';
import { Params } from 'express-serve-static-core';
import { validationResult } from 'express-validator/src/validation-result';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";

import mockCsrfProtectionMiddleware from "../../__mocks__/csrfProtectionMiddleware.mock";
import app from "../../../src/app";

import { authentication } from '../../../src/middleware/authentication.middleware';
import { hasTrustWithIdUpdate } from '../../../src/middleware/navigation/has.trust.middleware';
import { mapCommonTrustDataToPage } from '../../../src/utils/trust/common.trust.data.mapper';
import { saveAndContinue } from '../../../src/utils/save.and.continue';
import { isActiveFeature } from '../../../src/utils/feature.flag';
import { companyAuthentication } from '../../../src/middleware/company.authentication.middleware';
import { hasUpdatePresenter } from '../../../src/middleware/navigation/update/has.presenter.middleware';
import { serviceAvailabilityMiddleware } from '../../../src/middleware/service.availability.middleware';
import { checkRelevantPeriod } from "../../../src/utils/relevant.period";
import { isRegistrationJourney } from '../../../src/utils/url';

import { get, post } from "../../../src/controllers/update/update.trusts.individual.beneficial.owner.controller";
import { IndividualTrustee, Trust, TrustKey } from '../../../src/model/trust.model';
import { fetchApplicationData, setExtraData } from '../../../src/utils/application.data';
import { APPLICATION_DATA_MOCK, TRUST_WITH_ID } from '../../__mocks__/session.mock';

import {
  ANY_MESSAGE_ERROR,
  PAGE_TITLE_ERROR,
  TRUSTEE_STILL_INVOLVED_TEXT,
  UPDATE_TELL_US_ABOUT_THE_INDIVIDUAL_HEADING
} from '../../__mocks__/text.mock';

import {
  TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL,
  TRUST_INVOLVED_URL,
  UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
  UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL
} from '../../../src/config';

import {
  mapIndividualTrusteeToSession,
  mapIndividualTrusteeByIdFromSessionToPage
} from '../../../src/utils/trust/individual.trustee.mapper';

import {
  getTrustByIdFromApp,
  saveIndividualTrusteeInTrust,
  saveTrustInApp
} from '../../../src/utils/trusts';

mockCsrfProtectionMiddleware.mockClear();
const mockSaveAndContinue = saveAndContinue as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockFetchApplicationData = fetchApplicationData as jest.Mock;

const mockCompanyAuthentication = (companyAuthentication as jest.Mock);
mockCompanyAuthentication.mockImplementation((_, __, next: NextFunction) => next());

const mockAuthentication = (authentication as jest.Mock);
mockAuthentication.mockImplementation((_, __, next: NextFunction) => next());

const mockHasUpdatePresenter = (hasUpdatePresenter as jest.Mock);
mockHasUpdatePresenter.mockImplementation((_, __, next: NextFunction) => next());

const mockHasTrustWithIdUpdate = (hasTrustWithIdUpdate as jest.Mock);
mockHasTrustWithIdUpdate.mockImplementation((_, __, next: NextFunction) => next());

const mockServiceAvailabilityMiddleware = (serviceAvailabilityMiddleware as jest.Mock);
mockServiceAvailabilityMiddleware.mockImplementation((_, __, next: NextFunction) => next());
const mockCheckRelevantPeriod = checkRelevantPeriod as jest.Mock;

const mockIsRegistrationJourney = isRegistrationJourney as jest.Mock;
mockIsRegistrationJourney.mockReturnValue(false);

describe('Update Trust Individual Beneficial Owner Controller', () => {

  const mockNext = jest.fn();
  let mockAppData = {};
  let mockReq = {} as Request;

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL + "/" + trustId + TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL;

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

  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;

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
      query: {}
    } as Request;
  });

  describe('GET unit tests', () => {

    test(`renders the ${UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE} page`, async () => {
      const expectMapResult = { dummyKey: 'EXPECT-MAP-RESULT' };
      (mapIndividualTrusteeByIdFromSessionToPage as jest.Mock).mockReturnValueOnce(expectMapResult);
      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust1Data);
      mockCheckRelevantPeriod.mockReturnValueOnce(true);
      mockIsActiveFeature.mockReturnValueOnce(false);
      mockFetchApplicationData.mockReturnValue(APPLICATION_DATA_MOCK);

      await get({ ...mockReq, url: UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE } as Request, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();
      expect(mockRes.render).toBeCalledTimes(1);
      expect(mockRes.render).toBeCalledWith(
        UPDATE_TRUSTS_INDIVIDUAL_BENEFICIAL_OWNER_PAGE,
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
      mockFetchApplicationData.mockImplementationOnce(() => { throw error; });
      get(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('POST unit tests', () => {

    test('Save', async () => {
      const mockTrustee = {} as IndividualTrustee ;
      (mapIndividualTrusteeToSession as jest.Mock).mockReturnValue(mockTrustee);

      mockFetchApplicationData.mockReturnValue(mockAppData);

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
    });

    test('catch error when renders the page', async () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mapIndividualTrusteeToSession as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });
      await post(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
  });

  describe('Endpoint Access tests with supertest', () => {

    test(`successfully access GET method`, async () => {
      const mockTrust = {
        trustName: 'dummyName',
      };

      (mapCommonTrustDataToPage as jest.Mock).mockReturnValue(mockTrust);

      const resp = await request(app).get(pageUrl);
      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(UPDATE_TELL_US_ABOUT_THE_INDIVIDUAL_HEADING);
      expect(resp.text).toContain(mockTrust.trustName);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(resp.text).toContain(TRUSTEE_STILL_INVOLVED_TEXT);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      (validationResult as any as jest.Mock).mockImplementationOnce(() => ({
        isEmpty: jest.fn().mockReturnValue(true),
      }));

      const resp = await request(app).post(pageUrl).send({});

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${UPDATE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${trustId}${TRUST_INVOLVED_URL}`);
      expect(authentication).toBeCalledTimes(1);
      expect(hasTrustWithIdUpdate).toBeCalledTimes(1);
      expect(mockSaveAndContinue).toHaveBeenCalledTimes(1);
    });
  });
});
