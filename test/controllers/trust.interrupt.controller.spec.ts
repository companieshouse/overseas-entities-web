jest.mock("ioredis");
jest.mock('../../src/middleware/authentication.middleware');
jest.mock('../../src/middleware/is.feature.enabled.middleware', () => ({
  isFeatureEnabled: () => (_, __, next: NextFunction) => next(),
}));

import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { NextFunction, Request, Response } from "express";
import { Session } from '@companieshouse/node-session-handler';
import request from "supertest";
import app from "../../src/app";
import { ANY_MESSAGE_ERROR, PAGE_TITLE_ERROR } from '../__mocks__/text.mock';
import { TRUST_ENTRY_URL, TRUST_INTERRUPT_URL } from '../../src/config';
import { get, post, TRUST_INTERRUPT_TEXTS } from '../../src/controllers/trust.interrupt.controller';
import { authentication } from '../../src/middleware/authentication.middleware';

describe('Trust Interrupt controller', () => {

  const pageUrl = `${TRUST_ENTRY_URL}${TRUST_INTERRUPT_URL}`;

  let mockReq = {} as Request;
  const mockRes = {
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const mockNext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      session: {} as Session,
      route: '',
      method: '',
      body: {},
    } as Request;
  });

  describe('GET unit tests', () => {
    test(('success'), () => {

      get(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).not.toBeCalled();

      expect(mockRes.render).toBeCalledTimes(1);
    });
  });

  describe('POST unit tests', () => {
    test('continue button pushed', () => {
      post(mockReq, mockRes, mockNext);

      expect(mockRes.redirect).toBeCalledTimes(1);
      expect(mockRes.redirect).toBeCalledWith(`${TRUST_ENTRY_URL}`);
    });

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

  describe('Endpoint Access tests with supertest', () => {
    beforeEach(() => {
      (authentication as jest.Mock).mockImplementation((_, __, next: NextFunction) => next());
    });

    test(`successfully access GET method`, async () => {

      const resp = await request(app).get(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_OK);
      expect(resp.text).toContain(TRUST_INTERRUPT_TEXTS.title);
      expect(resp.text).not.toContain(PAGE_TITLE_ERROR);

      expect(authentication).toBeCalledTimes(1);
    });

    test('successfully access POST method', async () => {
      const resp = await request(app).post(pageUrl);

      expect(resp.status).toEqual(constants.HTTP_STATUS_FOUND);
      expect(resp.header.location).toEqual(`${TRUST_ENTRY_URL}`);

      expect(authentication).toBeCalledTimes(1);
    });
  });
});
