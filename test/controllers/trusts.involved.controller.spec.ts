jest.mock("ioredis");
jest.mock(".../../../src/utils/application.data");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/navigation/has.trust.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));

import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Params } from 'express-serve-static-core';
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";
import { get, post, TRUST_INVOLVED_TEXTS } from "../../src/controllers/trust.involved.controller";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from '../__mocks__/text.mock';
import { authentication } from '../../src/middleware/authentication.middleware';
import { hasTrust } from '../../src/middleware/navigation/has.trust.middleware';
import { CHECK_YOUR_ANSWERS_URL, TRUST_INVOLVED_URL, TRUST_HISTORICAL_BENEFICIAL_OWNER_URL, TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL } from '../../src/config';
import { TrusteeType } from '../../src/model/trustee.type.model';
import { getApplicationData } from '../../src/utils/application.data';
import { APPLICATION_DATA_WITH_TRUST_ID_MOCK, TRUST_WITH_ID } from '../__mocks__/session.mock';


describe('Trust Involved controller', () => {
  const mockGetApplicationData = getApplicationData as jest.Mock;

  const trustId = TRUST_WITH_ID.trust_id;
  const pageUrl = TRUST_INVOLVED_URL + "/" + trustId;

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();


  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: {
        trustId: trustId,
      } as Params,
      session: {} as Session,
      route: '',
      method: '',
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

    describe('POST unit tests', () => {

      test('catch error when post data from page', () => {
        mockReq.body = {
          id: 'dummyId',
          typeOfTrustee: 'dummyTrusteeType',
          noMoreToAdd: 'add',
        };
        const error = new Error(ANY_MESSAGE_ERROR);
        (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
          throw error;
        });

        post(mockReq, mockRes, mockNext);

        expect(mockNext).toBeCalledTimes(1);
        expect(mockNext).toBeCalledWith(error);
      });

    });

  });

  describe('Endpoint Access tests with supertest', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrust as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      mockGetApplicationData.mockReturnValue(APPLICATION_DATA_WITH_TRUST_ID_MOCK);

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_INVOLVED_TEXTS.title);
      expect(resp.text).toContain(TRUST_WITH_ID.trust_name);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test('successfully access POST method with historic Trustee type', async () => {

      const resp = await request(app)
        .post(pageUrl)
        .send({ typeOfTrustee: TrusteeType.HISTORICAL });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_INVOLVED_URL}/${trustId}${TRUST_HISTORICAL_BENEFICIAL_OWNER_URL}`);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test('successfully access POST method with individual Trustee type', async () => {

      const resp = await request(app)
        .post(pageUrl)
        .send({ typeOfTrustee: TrusteeType.INDIVIDUAL });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_INVOLVED_URL}/${trustId}${TRUST_INDIVIDUAL_BENEFICIAL_OWNER_URL}`);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test('successfully access POST method with legalEntity Trustee type', async () => {

      const resp = await request(app)
        .post(pageUrl)
        .send({ typeOfTrustee: TrusteeType.LEGAL_ENTITY });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_INVOLVED_URL}/${trustId}`);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test('successfully access POST method with unknown Trustee type', async () => {

      const resp = await request(app)
        .post(pageUrl)
        .send({ typeOfTrustee: 'unknown' });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_INVOLVED_URL}/${trustId}`);
      expect(hasTrust).toBeCalledTimes(1);
    });

    test('no more to add button goes to the Check your answers page', async () => {

      const resp = await request(app)
        .post(pageUrl)
        .send({ noMoreToAdd: 'noMoreToAdd' });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(CHECK_YOUR_ANSWERS_URL);
      expect(hasTrust).toBeCalledTimes(1);
    });
  });

});
