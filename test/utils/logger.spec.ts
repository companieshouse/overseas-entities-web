import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { beforeEach, describe, expect, test, jest } from '@jest/globals';

import { createAndLogErrorRequest, logger } from "../../src/utils/logger";
import { Request } from "express";
import { ANY_MESSAGE_ERROR } from "../__mocks__/text.mock";

logger.errorRequest = jest.fn();
let req: Request;

describe("logger tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    req = {} as Request;
  });

  test("Should test the logger object is defined of type ApplicationLogger", () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(ApplicationLogger);
  });

  test("Should log and return an error", () => {
    const err: Error = createAndLogErrorRequest(req, ANY_MESSAGE_ERROR);

    expect(err.message).toEqual(ANY_MESSAGE_ERROR);
    expect(logger.errorRequest).toHaveBeenCalledTimes(1);
    expect(logger.errorRequest).toHaveBeenCalledWith(req, expect.stringContaining(ANY_MESSAGE_ERROR));
  });
});
