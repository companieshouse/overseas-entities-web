/**
 * Shows service offline page if config flag SHOW_SERVICE_OFFLINE_PAGE=true
 */
import { NextFunction, Request, Response } from "express";
import { SHOW_SERVICE_OFFLINE_PAGE } from "../utils/properties";
import { isActiveFeature } from "../utils/feature.flag";
import { Templates } from "../types/template.paths";

export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (isActiveFeature(SHOW_SERVICE_OFFLINE_PAGE)) {
    return res.render(Templates.SERVICE_OFFLINE);
  }

  // feature flag SHOW_SERVICE_OFFLINE_PAGE is false - carry on as normal
  return next();
};
