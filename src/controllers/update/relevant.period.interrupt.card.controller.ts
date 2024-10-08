import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_INTERRUPT_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_INTERRUPT_PAGE, {
      backLinkUrl: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM,
      templateName: config.RELEVANT_PERIOD_INTERRUPT_PAGE,
      ...appData
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_INTERRUPT_PAGE}`);

    return res.redirect(config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL + config.RELEVANT_PERIOD_QUERY_PARAM); // redirects to statement 3 page
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
