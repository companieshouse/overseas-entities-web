/**
 * Middleware to check and set the journey type (which can then be used by page templates to set the banner, etc..)
 */
import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import { JourneyType, ROUTE_PARAM_SUBMISSION_ID, ROUTE_PARAM_TRANSACTION_ID } from "../../config";
import { isRemoveJourney, isUpdateJourney, getTransactionIdAndSubmissionIdFromOriginalUrl } from "../../utils/url";

export const journeyDetectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const entityIds = getTransactionIdAndSubmissionIdFromOriginalUrl(req);
    req.params[ROUTE_PARAM_TRANSACTION_ID] = entityIds?.[ROUTE_PARAM_TRANSACTION_ID] ?? "";
    req.params[ROUTE_PARAM_SUBMISSION_ID] = entityIds?.[ROUTE_PARAM_SUBMISSION_ID] ?? "";

    const isRemove: boolean = await isRemoveJourney(req);
    const isUpdate: boolean = await isUpdateJourney(req);

    if (isRemove) {
      logger.infoRequest(req, "Marking this request/response as a Remove Journey");
      res.locals.journey = JourneyType.remove;
    } else if (isUpdate) {
      logger.infoRequest(req, "Marking this request/response as a Update Journey");
      res.locals.journey = JourneyType.update;
    } else {
      logger.infoRequest(req, "Marking this request/response as a Registration Journey");
      res.locals.journey = JourneyType.register;
    }

  } catch (error) {
    logger.errorRequest(req, "Error occurred in journey detection middleware: " + error);
  } finally {
    next();
  }
};
