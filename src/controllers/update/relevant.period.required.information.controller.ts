import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { RequiredInformation } from "../../model/update.type.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req);

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

export const post = async(req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE}`);
    let redirectUrl: string = '';
    const appData: ApplicationData = await getApplicationData(req);
    const requiredInformation = req.body[RequiredInformation];

    if (appData.update) {
      appData.update[RequiredInformation] = requiredInformation === "1";
    }

    if (requiredInformation === '1') {
      redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE_URL,
      }) + config.RELEVANT_PERIOD_QUERY_PARAM;
    } else {
      redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_URL,
      });
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
