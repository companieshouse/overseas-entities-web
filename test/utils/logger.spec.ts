import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { beforeEach, describe, expect, test, jest } from '@jest/globals';

import { createAndLogError, logger } from "../../src/utils/logger";
import { ANY_MESSAGE_ERROR } from "../__mocks__/text.mock";

logger.error = jest.fn();

describe("logger tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should test the logger object is defined of type ApplicationLogger", () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(ApplicationLogger);
  });

  test("Should log and return an error", () => {
    const err: Error = createAndLogError(ANY_MESSAGE_ERROR);

    expect(err.message).toEqual(ANY_MESSAGE_ERROR);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining(ANY_MESSAGE_ERROR));
  });
});
