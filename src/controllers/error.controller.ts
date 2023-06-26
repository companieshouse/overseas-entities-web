import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";

const pageNotFound = (req: Request, res: Response) => {
  let isRegistration: boolean = req.path.startsWith(config.UPDATE_LANDING_URL);
  if (req.path.startsWith(config.UPDATE_LANDING_URL)) {
    isRegistration = false;
  }
  return res.status(404).render(config.NOT_FOUND_PAGE, {
    isRegistration
  });
};

/**
 * This handler catches any other error thrown within the application.
 * Use this error handler by calling next(e) from within a controller
 * Always keep this as the last handler in the chain for it to work.
 */
const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.errorRequest(req, `An error has occurred. Re-routing to the error screen - ${err.stack}`);

  let isRegistration: boolean = req.path.startsWith(config.UPDATE_LANDING_URL);
  if (req.path.startsWith(config.UPDATE_LANDING_URL)) {
    isRegistration = false;
  }
  res.status(500).render(config.ERROR_PAGE, {
    templateName: config.ERROR_PAGE,
    isRegistration
  });
};

export default [pageNotFound, errorHandler];
