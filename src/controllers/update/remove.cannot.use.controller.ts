import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_CANNOT_USE_PAGE}`);

    let backLinkUrl = "";
    const previousPage = req.query[config.PREVIOUS_PAGE_QUERY_PARAM];
    if (previousPage) {
      backLinkUrl = `${previousPage}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
    }

    return res.render(config.REMOVE_CANNOT_USE_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl,
      templateName: config.REMOVE_CANNOT_USE_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
