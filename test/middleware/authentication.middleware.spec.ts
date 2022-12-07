jest.mock("ioredis");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import request from "supertest";

import app from "../../src/app";

import { getSessionRequestWithPermission, userMail } from '../__mocks__/session.mock';
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from '../../src/utils/logger';
import { SOLD_LAND_FILTER_URL } from '../../src/config';
import { ANY_MESSAGE_ERROR, REDIRECT_TO_SIGN_IN_PAGE } from '../__mocks__/text.mock';

jest.mock('../../src/utils/logger', () => {
  return {
    logger: { info: jest.fn(), infoRequest: jest.fn(), errorRequest: jest.fn() }
  };
});

const req = {} as Request;
const res = { locals: {}, redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe('Authentication middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    res.locals = {};
  });

  test("should call next() and log user signin", () => {
    const mockLogInfoMsg = `User (${userMail}) is signed in`;
    req.session = getSessionRequestWithPermission();

    authentication(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(logger.errorRequest).not.toHaveBeenCalled();

    expect(res.redirect).not.toHaveBeenCalled();
    expect(res.locals).toEqual({ userEmail: userMail });
  });

  test(`should redirect to signin page with ${SOLD_LAND_FILTER_URL} page as return page`, () => {
   shouldRedirect(SOLD_LAND_FILTER_URL);
  });

  test(`should redirect to signin page with ${OVERSEAS_ENTITY_QUERY_URL} page as return page`, () => {
    shouldRedirect(OVERSEAS_ENTITY_QUERY_URL);
  });

  test('should catch the error and call next(err)', () => {
    const error = new Error(ANY_MESSAGE_ERROR);
    const resThrowsToBeCatched = { redirect: jest.fn(() => { throw error; }) } as any;
    req.session = undefined;

    authentication(req, resThrowsToBeCatched, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);

    expect(res.locals).toEqual({});
  });

  test("should redirect to signin page", async () => {
    const resp = await request(app).get(SOLD_LAND_FILTER_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain('/signin');

    expect(res.locals).toEqual({});
  });

  test("update should redirect to signin page", async () => {
    const resp = await request(app).get(OVERSEAS_ENTITY_QUERY_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain('/signin');

    expect(res.locals).toEqual({});
  });

  function shouldRedirect(returnUrl : string) {
    const signinRedirectPath = `/signin?return_to=${returnUrl}`;
    req.session = undefined;

    authentication(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(signinRedirectPath);
    expect(res.locals).toEqual({});

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, REDIRECT_TO_SIGN_IN_PAGE);
    expect(logger.errorRequest).not.toHaveBeenCalled();
  }
});
