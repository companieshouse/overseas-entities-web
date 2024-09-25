/**
 * Middleware to check and set the journey type (which can then be used by page templates to set the banner, etc..)
 */
import { NextFunction, Request, Response } from "express";

import {
  JourneyType
} from "../../config";

import { logger } from "../../utils/logger";
import { isRegistrationJourney, isRemoveJourney, isUpdateJourney } from "../../utils/url";

export const journeyDetectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const isRemove: boolean = await isRemoveJourney(req);
  const isUpdate: boolean = await isUpdateJourney(req);
  const isRegistration: boolean = isRegistrationJourney(req);

  if (isRemove) {
    logger.infoRequest(req, "Marking this request/response as a Remove Journey");
    res.locals.journey = JourneyType.remove;
  } else if (isUpdate) {
    logger.infoRequest(req, "Marking this request/response as a Update Journey");
    res.locals.journey = JourneyType.update;
  } else if (isRegistration) {
    logger.infoRequest(req, "Marking this request/response as a Registration Journey");
    res.locals.journey = JourneyType.register;
  }

  return next();
};
