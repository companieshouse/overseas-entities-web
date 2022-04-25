jest.mock("ioredis");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import request from "supertest";

import app from "../../src/app";

import { getSessionRequestWithPermission, userMail } from '../__mocks__/session.mock';
import { authentication } from "../../src/controllers";
import { logger } from '../../src/utils/logger';
import { PRESENTER_URL } from '../../src/config';
import { ANY_MESSAGE_ERROR } from '../__mocks__/text.mock';

jest.mock('../../src/utils/logger', () => {
  return {
    logger: { info: jest.fn(), infoRequest: jest.fn(), errorRequest: jest.fn() }
  };
});

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe('Authentication controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  test("should redirect to signin page with presenter page as return page", () => {
    const mockLogInfoMsg = 'User not authenticated, status_code=401, redirecting to sign in page';
    const signinRedirectPath = `/signin?return_to=${PRESENTER_URL}`;
    req.session = undefined;

    authentication(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(signinRedirectPath);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, mockLogInfoMsg);
    expect(logger.errorRequest).not.toHaveBeenCalled();
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
  });

  test("should redirect to signin page", async () => {
    const resp = await request(app).get(PRESENTER_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain('/signin');
  });
});
