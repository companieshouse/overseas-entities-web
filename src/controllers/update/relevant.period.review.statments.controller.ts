import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req);

    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL,
    }) + config.RELEVANT_PERIOD_QUERY_PARAM;

    return res.render(config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE, {
      ...appData,
      backLinkUrl,
      templateName: config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE,
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_REVIEW_STATEMENTS_PAGE}`);
    return res.redirect(getRedirectUrl({
      req,
      urlWithEntityIds: config.UPDATE_FILING_DATE_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.UPDATE_FILING_DATE_URL,
    }));
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
