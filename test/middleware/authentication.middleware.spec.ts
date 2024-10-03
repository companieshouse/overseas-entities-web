jest.mock("ioredis");

import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import request from "supertest";

import app from "../../src/app";

import {
  getSessionRequestWithPermission,
  RESUME_SUBMISSION_URL,
  userMail
} from '../__mocks__/session.mock';
import { authentication } from "../../src/middleware/authentication.middleware";
import { logger } from '../../src/utils/logger';
import {
  JOURNEY_QUERY_PARAM,
  JourneyType,
  LANDING_URL,
  UPDATE_LANDING_URL,
  RESUME,
  SOLD_LAND_FILTER_URL,
  STARTING_NEW_URL,
  SECURE_UPDATE_FILTER_URL,
  UPDATE_CONTINUE_WITH_SAVED_FILING_URL
} from '../../src/config';

import { ANY_MESSAGE_ERROR, REDIRECT_TO_SIGN_IN_PAGE } from '../__mocks__/text.mock';
import { isActiveFeature } from "../../src/utils/feature.flag";

jest.mock("../../src/utils/feature.flag" );
jest.mock('../../src/utils/logger', () => {
  return {
    logger: { debug: jest.fn(), info: jest.fn(), infoRequest: jest.fn(), errorRequest: jest.fn() }
  };
});

const req = { query: {} } as Request;
const res = { locals: {}, redirect: jest.fn() as any } as Response;
const next = jest.fn();

const mockIsActiveFeature = isActiveFeature as jest.Mock;

function setReadOnlyRequestProperty(req: Request, propertyName: string, propertyValue: string) {
  Object.defineProperties(req, {
    [propertyName]: {
      value: propertyValue,
      writable: true
    }
  });
}

describe('Authentication middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsActiveFeature.mockReset();
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
    const signinRedirectPath = `/signin?return_to=${SOLD_LAND_FILTER_URL}`;
    req.session = undefined;
    setReadOnlyRequestProperty(req, 'path', `${LANDING_URL}`);

    authentication(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(signinRedirectPath);
    expect(res.locals).toEqual({});

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, REDIRECT_TO_SIGN_IN_PAGE);
    expect(logger.errorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to signin page with ${SECURE_UPDATE_FILTER_URL} page as return page`, () => {
    const signinRedirectPath = `/signin?return_to=${SECURE_UPDATE_FILTER_URL}`;
    req.session = undefined;
    setReadOnlyRequestProperty(req, 'path', `${UPDATE_LANDING_URL}`);

    authentication(req, res, next);

    expect(next).not.toHaveBeenCalled();

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(signinRedirectPath);
    expect(res.locals).toEqual({});

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, REDIRECT_TO_SIGN_IN_PAGE);
    expect(logger.errorRequest).not.toHaveBeenCalled();
  });

  test(`should redirect to signin page with ${STARTING_NEW_URL} page as return page`, () => {
    const signinRedirectPath = `/signin?return_to=${STARTING_NEW_URL}`;
    req.session = undefined;
    setReadOnlyRequestProperty(req, 'path', `${STARTING_NEW_URL}`);

    authentication(req, res, next);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(signinRedirectPath);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, REDIRECT_TO_SIGN_IN_PAGE);

    expect(logger.errorRequest).not.toHaveBeenCalled();

    expect(next).not.toHaveBeenCalled();
  });

  test(`should redirect to signin page with ${RESUME_SUBMISSION_URL} page as return page`, () => {
    const signinRedirectPath = `/signin?return_to=${RESUME_SUBMISSION_URL}`;
    req.session = undefined;
    setReadOnlyRequestProperty(req, 'path', `${RESUME_SUBMISSION_URL}`);

    authentication(req, res, next);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(signinRedirectPath);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.infoRequest).toHaveBeenCalledWith(req, REDIRECT_TO_SIGN_IN_PAGE);

    expect(logger.errorRequest).not.toHaveBeenCalled();

    expect(next).not.toHaveBeenCalled();
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
    mockIsActiveFeature.mockReturnValueOnce(false);
    mockIsActiveFeature.mockReturnValueOnce(false);
    const resp = await request(app).get(SOLD_LAND_FILTER_URL);

    expect(resp.status).toEqual(302);
    expect(resp.text).toContain('/signin');

    expect(res.locals).toEqual({});
  });

  test("should redirect to signin page for update", async () => {
    const signinRedirectPath = `/signin?return_to=${SECURE_UPDATE_FILTER_URL}`;

    mockIsActiveFeature.mockReturnValueOnce(false); // SHOW_SERVICE_OFFLINE_PAGE
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL
    const resp = await request(app).get(SECURE_UPDATE_FILTER_URL);

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(signinRedirectPath);

    expect(res.locals).toEqual({});
  });

  test("should redirect to signin page for remove", async () => {
    const signinRedirectPath = "/signin?return_to=" + encodeURIComponent(`${UPDATE_CONTINUE_WITH_SAVED_FILING_URL}?journey=remove`);

    mockIsActiveFeature.mockReturnValueOnce(false); // SHOW_SERVICE_OFFLINE_PAGE
    mockIsActiveFeature.mockReturnValueOnce(false); // FEATURE_FLAG_ENABLE_REDIS_REMOVAL

    const resp = await request(app).get(`${UPDATE_CONTINUE_WITH_SAVED_FILING_URL}?${JOURNEY_QUERY_PARAM}=${JourneyType.remove}`);

    expect(resp.status).toEqual(302);
    expect(resp.header.location).toEqual(signinRedirectPath);

    expect(res.locals).toEqual({});
  });

  test(`should throw error when request path is invalid`, () => {
    req.session = undefined;
    setReadOnlyRequestProperty(req, 'path', `/INVALID/${RESUME}`);

    authentication(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();

    expect(next).toHaveBeenCalledTimes(1);

    expect(logger.infoRequest).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);

    expect(res.locals).toEqual({});
  });
});
