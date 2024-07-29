/**
 * Shows service offline page if config flag SHOW_SERVICE_OFFLINE_PAGE=true
 */
import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";

import {
  SERVICE_OFFLINE_PAGE,
  SHOW_SERVICE_OFFLINE_PAGE,
} from "../config";
import { logger } from "../utils/logger";

export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (isActiveFeature(SHOW_SERVICE_OFFLINE_PAGE)) {
    logger.infoRequest(req, "Service offline flag is set - displaying service offline page");
    return res.render(SERVICE_OFFLINE_PAGE);
  }

  // feature flag SHOW_SERVICE_OFFLINE_PAGE is false - carry on as normal
  return next();
};
