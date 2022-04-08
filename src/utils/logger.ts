import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";

import { APPLICATION_NAME } from "../config";

export const logger: ApplicationLogger = createLogger(APPLICATION_NAME);

export const createAndLogError = (description: string): Error => {
  const error = new Error (description);
  logger.error(`${error.stack}`);
  return error;
};
