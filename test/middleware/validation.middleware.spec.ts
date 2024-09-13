jest.mock("ioredis");
jest.mock("express-validator" );
jest.mock("../../src/utils/logger");

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { validationResult } from "express-validator";
import { Request, Response } from 'express';

import { checkValidations } from '../../src/middleware/validation.middleware';
import { logger } from "../../src/utils/logger";
import { ANY_MESSAGE_ERROR } from '../__mocks__/text.mock';

const mockValidationResult = validationResult as unknown as jest.Mock;
const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("Validation Middleware tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should catch the error and call next(err)", async () => {
    mockValidationResult.mockImplementationOnce( () => { throw new Error(ANY_MESSAGE_ERROR); });
    await checkValidations(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(mockLoggerErrorRequest).toHaveBeenCalledTimes(1);
  });

});
