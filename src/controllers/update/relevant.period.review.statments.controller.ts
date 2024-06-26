import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE, {
      backLinkUrl: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL,
      templateName: config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE}`);
    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
