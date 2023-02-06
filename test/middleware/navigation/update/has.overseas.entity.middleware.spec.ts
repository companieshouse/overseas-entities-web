jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/middleware/navigation/check.condition');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
import { SECURE_UPDATE_FILTER_PAGE, SECURE_UPDATE_FILTER_URL, OVERSEAS_ENTITY_QUERY_URL } from '../../../../src/config';
import { ANY_MESSAGE_ERROR } from '../../../__mocks__/text.mock';

import {
  checkOverseasEntityNumberEntered,
  checkHasOverseasEntity,
  checkHasDateOfCreation,
  NavigationErrorMessage
} from '../../../../src/middleware/navigation/check.condition';

import { hasOverseasEntityNumber, hasOverseasEntity } from '../../../../src/middleware/navigation/update/has.overseas.entity.middleware';

const mockCheckOverseasEntityDetailsEntered = checkOverseasEntityNumberEntered as unknown as jest.Mock;
const mockLoggerInfoRequest = logger.infoRequest as jest.Mock;

const mockCheckOverseasEntity = checkHasOverseasEntity as unknown as jest.Mock;
const mockCheckHasDateOfCreation = checkHasDateOfCreation as unknown as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("has.overseas.entity navigation entity number validation tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${SECURE_UPDATE_FILTER_PAGE} page and log message error ${NavigationErrorMessage}`, () => {
    mockCheckOverseasEntityDetailsEntered.mockImplementationOnce( () => { return false; });
    hasOverseasEntityNumber(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
  });

  test(`should not redirect and pass to the next middleware`, () => {
    mockCheckOverseasEntityDetailsEntered.mockImplementationOnce( () => { return true; });
    hasOverseasEntityNumber(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", () => {
    mockCheckOverseasEntityDetailsEntered.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    hasOverseasEntityNumber(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});

describe("has.overseas.entity navigation entity middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${OVERSEAS_ENTITY_QUERY_URL} page and log message error ${NavigationErrorMessage}`, () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { return false; });
    hasOverseasEntity(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`should redirect when no creation date to ${OVERSEAS_ENTITY_QUERY_URL} page and log message error ${NavigationErrorMessage}`, () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { return true; });
    mockCheckHasDateOfCreation.mockImplementationOnce( () => { return false; });
    hasOverseasEntity(req, res, next);

    expect(next).not.toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);

    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`should not redirect and pass to the next middleware`, () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { return true; });
    mockCheckHasDateOfCreation.mockImplementationOnce( () => { return true; });
    hasOverseasEntity(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    hasOverseasEntity(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});

