import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { fetchApplicationData } from "../../utils/application.data";
import { checkRelevantPeriod } from "../../utils/relevant.period";
import { getRedirectUrl, isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);

    return res.render(config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE, {
      ...appData,
      templateName: config.UPDATE_BENEFICIAL_OWNER_BO_MO_REVIEW_PAGE,
      backLinkUrl: getRedirectUrl({
        req,
        urlWithEntityIds: config.OVERSEAS_ENTITY_UPDATE_DETAILS_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.OVERSEAS_ENTITY_UPDATE_DETAILS_URL,
      }),
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    let redirectUrl: string;

    if (checkRelevantPeriod(appData)) {
      redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      }) + config.RELEVANT_PERIOD_QUERY_PARAM;
    } else {
      redirectUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      });
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
