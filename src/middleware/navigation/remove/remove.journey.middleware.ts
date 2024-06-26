/**
 * Middleware to check if this request is for a Remove journey and if so set this as the
 * journey type (which can then be used by page templates to set the banner etc.).
 */
import { NextFunction, Request, Response } from "express";

import {
  JourneyType
} from "../../../config";
import { logger } from "../../../utils/logger";
import { isRemoveJourney } from "../../../utils/url";

export const removeJourneyMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  if (await isRemoveJourney(req)) {
    logger.infoRequest(req, "Marking this request/response as a Remove Journey");
    res.locals.journey = JourneyType.remove;
  }

  return next();
};
