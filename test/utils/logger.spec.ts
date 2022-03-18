import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { logger } from "../../src/utils/logger";

describe("logger tests", () => {
  it("Should test the logger object is defined of type ApplicationLogger", () => {
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(ApplicationLogger);
  });
});
