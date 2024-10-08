import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { checkRelevantPeriod } from "../../utils/relevant.period";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData: ApplicationData = await getApplicationData(req.session);
    const backLinkUrl = config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL;
    return res.render(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE, {
      backLinkUrl,
      templateName: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
      ...appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = await getApplicationData(req.session);
    if (checkRelevantPeriod(appData)) {
      return res.redirect(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL + config.RELEVANT_PERIOD_QUERY_PARAM);
    } else {
      return res.redirect(config.UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
