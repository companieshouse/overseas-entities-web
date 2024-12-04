jest.mock("ioredis");
jest.mock("../../../src/utils/logger");
jest.mock('../../../src/middleware/navigation/check.condition');

import { Request, Response } from 'express';
import { logger } from "../../../src/utils/logger";
import { generateSignOutBaseUrl } from '../../../src/middleware/navigation/sign.out.base.url';
import { REGISTER_AN_OVERSEAS_ENTITY_URL, UPDATE_AN_OVERSEAS_ENTITY_URL } from '../../../src/config';

const next = jest.fn();
const mockLoggerInfoRequest = logger.info as jest.Mock;
const urlPathWithIds = "/transaction/123/submission/345";
const urlPathWithoutIds = "";

describe("sign.out.base.url navigation middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test(`should generate the correct baseUrl for sign out for the registration journey when submission Id and entity Id are missing from the url `, () => {
    const request = {
      originalUrl: `${REGISTER_AN_OVERSEAS_ENTITY_URL}${urlPathWithoutIds}`,
      params: {}
    } as Request;

    const response = {
      locals: {}
    } as Response;

    generateSignOutBaseUrl(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(response.locals.signOutBaseUrl).toBe(REGISTER_AN_OVERSEAS_ENTITY_URL);
  });

  test(`should generate the correct baseUrl for sign out for the registration journey when submission Id and entity Id are present in the url `, () => {
    const request = {
      originalUrl: `${REGISTER_AN_OVERSEAS_ENTITY_URL}${urlPathWithIds}`,
      params: {}
    } as any;

    const response = {
      locals: {}
    } as Response;

    generateSignOutBaseUrl(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(response.locals.signOutBaseUrl).toBe(`${REGISTER_AN_OVERSEAS_ENTITY_URL}transaction/123/submission/345/`);
  });

  test(`should generate the correct baseUrl for sign out for the update/remove journey`, () => {
    const request = {
      originalUrl: `${UPDATE_AN_OVERSEAS_ENTITY_URL}${urlPathWithoutIds}`,
      params: {}
    } as Request;

    const response = {
      locals: {}
    } as Response;

    generateSignOutBaseUrl(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfoRequest).toHaveBeenCalledTimes(1);
    expect(response.locals.signOutBaseUrl).toBe(UPDATE_AN_OVERSEAS_ENTITY_URL);
  });

});
