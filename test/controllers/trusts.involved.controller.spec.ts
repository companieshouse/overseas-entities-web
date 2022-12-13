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
import { TRUST_INVOLVED_URL } from '../../src/config';


describe('Trust Involved controller', () => {

  const trustId = "725";
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
        id: trustId,
      } as Params,
      session: {} as Session,
      route: '',
      method: '',
    } as Request;
  });

  describe('GET unit tests', () => {

    test('catch error when renders the page', () => {
      const error = new Error(ANY_MESSAGE_ERROR);
      (mockRes.render as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);

      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
    });
/*
    describe('POST unit tests', () => {
      mockReq.body = {
        id: 'dummyId',
        typeOfTrustee: 'dummyTrusteeType',
        noMoreToAdd: 'add',
      };


      test('catch error when post data from page', () => {
        const error = new Error(ANY_MESSAGE_ERROR);
        (mockRes.redirect as jest.Mock).mockImplementationOnce(() => {
          throw error;
        });

        post(mockReq, mockRes, mockNext);

        expect(mockNext).toBeCalledTimes(1);
        expect(mockNext).toBeCalledWith(error);
      });

    });
    */
  });

  describe('Endpoint Access tests with supertest', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
      (hasTrust as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {
      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_INVOLVED_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);
    });

    test('successfully access POST method', async () => {

      const resp = await request(app)
        .post(pageUrl)
        .send({ typeOfTrustee: 'historical' });

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_INVOLVED_URL}/${trustId}`);
    });

  });

});
