jest.mock("ioredis");
jest.mock("../../../../src/utils/logger");
jest.mock('../../../../src/middleware/navigation/check.condition');

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { logger } from "../../../../src/utils/logger";
import { ANY_MESSAGE_ERROR } from '../../../__mocks__/text.mock';
import { hasOverseasEntityNumber, hasOverseasEntity } from '../../../../src/middleware/navigation/update/has.overseas.entity.middleware';

import {
  SECURE_UPDATE_FILTER_URL,
  OVERSEAS_ENTITY_QUERY_URL,
  SECURE_UPDATE_FILTER_PAGE,
} from '../../../../src/config';

import {
  checkOverseasEntityNumberEntered,
  checkHasOverseasEntity,
  checkHasDateOfCreation,
  NavigationErrorMessage
} from '../../../../src/middleware/navigation/check.condition';

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

  test(`should redirect to ${SECURE_UPDATE_FILTER_PAGE} page and log message error ${NavigationErrorMessage}`, async () => {
    mockCheckOverseasEntityDetailsEntered.mockImplementationOnce( () => { return false; });
    await hasOverseasEntityNumber(req, res, next);
    expect(next).not.toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(SECURE_UPDATE_FILTER_URL);
  });

  test(`should not redirect and pass to the next middleware`, async () => {
    mockCheckOverseasEntityDetailsEntered.mockImplementationOnce( () => { return true; });
    await hasOverseasEntityNumber(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", async () => {
    mockCheckOverseasEntityDetailsEntered.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    await hasOverseasEntityNumber(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});

describe("has.overseas.entity navigation entity middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should redirect to ${OVERSEAS_ENTITY_QUERY_URL} page and log message error ${NavigationErrorMessage}`, async () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { return false; });
    await hasOverseasEntity(req, res, next);
    expect(next).not.toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`should redirect when no creation date to ${OVERSEAS_ENTITY_QUERY_URL} page and log message error ${NavigationErrorMessage}`, async () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { return true; });
    mockCheckHasDateOfCreation.mockImplementationOnce( () => { return false; });
    await hasOverseasEntity(req, res, next);
    expect(next).not.toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(2);
    expect(mockLoggerInfoRequest).toHaveBeenCalledWith(req, NavigationErrorMessage);
    expect(res.redirect).toHaveBeenCalledTimes(1);
    expect(res.redirect).toHaveBeenCalledWith(OVERSEAS_ENTITY_QUERY_URL);
  });

  test(`should not redirect and pass to the next middleware`, async () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { return true; });
    mockCheckHasDateOfCreation.mockImplementationOnce( () => { return true; });
    await hasOverseasEntity(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should catch the error and call next(err)", async () => {
    mockCheckOverseasEntity.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    await hasOverseasEntity(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).not.toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

});

