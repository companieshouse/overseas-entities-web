/**
 * Shows service offline page if config flag SHOW_SERVICE_OFFLINE_PAGE=true
 */
import { NextFunction, Request, Response } from "express";
import { isActiveFeature } from "../utils/feature.flag";

import {
  FEATURE_FLAG_ENABLE_ROE_UPDATE,
  FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022,
  FEATURE_FLAG_ENABLE_ROE_REMOVE,
  RESUME,
  SERVICE_OFFLINE_PAGE,
  SHOW_SERVICE_OFFLINE_PAGE,
  STARTING_NEW_URL,
  UPDATE_LANDING_URL,
  REMOVE_SERVICE_NAME
} from "../config";
import { logger } from "../utils/logger";
import { isRemoveJourney } from "../utils/url";

export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (isActiveFeature(SHOW_SERVICE_OFFLINE_PAGE)) {
    logger.infoRequest(req, "Service offline flag is set - displaying service offline page");
    return res.render(SERVICE_OFFLINE_PAGE);
  }

  if (!isActiveFeature(FEATURE_FLAG_ENABLE_ROE_UPDATE) && req.path.startsWith(UPDATE_LANDING_URL)) {
    logger.infoRequest(req, "Feature update is disabled - displaying service offline page");
    return res.render(SERVICE_OFFLINE_PAGE);
  }

  if (isRemoveJourney(req) && !isActiveFeature(FEATURE_FLAG_ENABLE_ROE_REMOVE)) {
    logger.infoRequest(req, "Remove Journey feature flag is disabled - displaying service offline page");
    return res.render(SERVICE_OFFLINE_PAGE, { SERVICE_NAME: REMOVE_SERVICE_NAME });
  }

  if (
    (req.path === STARTING_NEW_URL || req.path.endsWith(`/${RESUME}`))
    &&
    !isActiveFeature(FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
    logger.infoRequest(req, "Save and resume flag is disabled - displaying service offline page");
    return res.render(SERVICE_OFFLINE_PAGE);
  }

  // feature flag SHOW_SERVICE_OFFLINE_PAGE is false - carry on as normal
  return next();
};
