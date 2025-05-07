import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE, {
      backLinkUrl: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL + config.RELEVANT_PERIOD_QUERY_PARAM,
      templateName: config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE}`);
    let redirectUrl: string = '';
    const required_information = req.body['required_information'];
    if (required_information === "1") {
      redirectUrl = config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE + config.RELEVANT_PERIOD_QUERY_PARAM;
    } else {
      redirectUrl = config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_URL;
    }
    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
