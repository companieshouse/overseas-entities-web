import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { Request } from "express";

import { APPLICATION_NAME } from "../config";

export const logger: ApplicationLogger = createLogger(APPLICATION_NAME);

export const createAndLogErrorRequest = (req: Request, description: string): Error => {
  const error = new Error (description);
  logger.errorRequest(req, `${error.stack}`);
  return error;
};
