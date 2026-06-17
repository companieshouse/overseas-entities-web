import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req);

    return res.render(config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_PAGE, {
      ...appData,
      templateName: config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_URL,
      }) + config.RELEVANT_PERIOD_QUERY_PARAM,
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
