import { Response } from 'express';
import { describe, expect, test } from '@jest/globals';
import { REGISTER_AN_OVERSEAS_ENTITY_URL } from '../../src/config';
import { safeRedirect } from '../../src/utils/http.ext';

describe("Validate safe redirect (Sonar claim)", () => {
  const mockRes = {
    redirect: jest.fn() as any,
  } as Response;

  beforeEach (() => {
    jest.clearAllMocks();

    mockRes.redirect = jest.fn();
  });

  test('Should return redirect on valid URL ', () => {
    const url = `${REGISTER_AN_OVERSEAS_ENTITY_URL}/testUrl`;

    safeRedirect(mockRes, url);

    expect(mockRes.redirect).toBeCalledTimes(1);
    expect(mockRes.redirect).toBeCalledWith(url);
  });

  test('Should throw error on bad URL', () => {
    expect(() => { safeRedirect(mockRes, 'wrongUrl'); }).toThrowError();
  });
});
