import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { CsrfError } from '@companieshouse/web-security-node';

const pageNotFound = (req: Request, res: Response) => {
  const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);

  return res.status(404).render(config.NOT_FOUND_PAGE, {
    isRegistration
  });
};

const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: NextFunction) => {
  const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);
  // Handle non-CSRF Errors immediately
  if (!(err instanceof CsrfError)) {
    return next(err);
  }

  return res.status(403).render(config.ERROR_PAGE, {
    templateName: config.ERROR_PAGE,
    isRegistration,
    csrfErrors: true
  });
};

/**
 * This handler catches any other error thrown within the application.
 * Use this error handler by calling next(e) from within a controller
 * Always keep this as the last handler in the chain for it to work.
 */
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.errorRequest(req, `An error has occurred. Re-routing to the error screen - ${err.stack}`);

  const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);

  res.status(500).render(config.ERROR_PAGE, {
    templateName: config.ERROR_PAGE,
    isRegistration
  });
};

export default [pageNotFound, csrfErrorHandler, errorHandler];
