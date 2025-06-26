import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { ProvideInformation } from "../../model/update.type.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_DO_YOU_WANT_TO_PROVIDE_PRE_REG_INFO_NOW_PAGE}`);
    const appData: ApplicationData = await getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_DO_YOU_WANT_TO_PROVIDE_PRE_REG_INFO_NOW_PAGE, {
      backLinkUrl: config.RELEVANT_PERIOD_REQUIRED_INFORMATION_CONFIRM_PAGE + config.RELEVANT_PERIOD_QUERY_PARAM,
      templateName: config.RELEVANT_PERIOD_DO_YOU_WANT_TO_PROVIDE_PRE_REG_INFO_NOW_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async(req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_DO_YOU_WANT_TO_PROVIDE_PRE_REG_INFO_NOW_PAGE}`);

    const provideInformation = req.body[ProvideInformation];
    const isProvidingInformationNow = provideInformation === "1";
    const appData: ApplicationData = await getApplicationData(req.session);

    if (appData.update) {
      appData.update[ProvideInformation] = isProvidingInformationNow;
    }

    const redirectUrl = isProvidingInformationNow
      ? config.RELEVANT_PERIOD_COMBINED_STATEMENTS_PAGE + config.RELEVANT_PERIOD_QUERY_PARAM
      : config.RELEVANT_PERIOD_SUBMIT_BY_PAPER_URL;

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

