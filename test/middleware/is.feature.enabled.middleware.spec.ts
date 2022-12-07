jest.mock('../../src/utils/feature.flag');

import { Request, Response } from 'express';
import { constants } from 'http2';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { isFeatureEnabled } from '../../src/middleware/is.feature.enabled.middleware';
import { logger } from '../../src/utils/logger';
import { NOT_FOUND_PAGE } from '../../src/config';
import { isActiveFeature } from '../../src/utils/feature.flag';

describe("IsFeatureEnabled Middleware tests", () => {
  const req = {} as Request;
  const res = {
    status: jest.fn().mockReturnThis() as any,
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const next = jest.fn();

  beforeEach(() => {
    logger.infoRequest = jest.fn();

    jest.clearAllMocks();
  });

  test("feature not enabled, should have 404 response status", () => {
    const expectResult = {} as Response;
    res.render = jest.fn(() => expectResult);

    (isActiveFeature as jest.Mock).mockReturnValue(false);

    const actual = isFeatureEnabled('false')(req, res, next);

    expect(actual).toBe(expectResult);

    expect(isActiveFeature as jest.Mock).toBeCalledWith('false');

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toBeCalledWith(constants.HTTP_STATUS_NOT_FOUND);
    expect(res.render).toBeCalledWith(NOT_FOUND_PAGE);
  });

  test("feature not enabled, should have 404 response status", () => {
    const expectResult = 'expectResult';
    next.mockReturnValue(expectResult);

    (isActiveFeature as jest.Mock).mockReturnValue(true);

    const actual = isFeatureEnabled('true')(req, res, next);

    expect(actual).toBe(expectResult);

    expect(isActiveFeature as jest.Mock).toBeCalledWith('true');

    expect(res.status).not.toBeCalled();
    expect(res.render).not.toBeCalled();
  });
});
