import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";
import {
  isRemoveJourney,
  getUrlWithTransactionIdAndSubmissionId,
  getTransactionIdAndSubmissionIdFromOriginalUrl,
} from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);

    if (isRemove) {
      return res.render(config.UPDATE_INTERRUPT_CARD_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: config.SECURE_UPDATE_FILTER_URL,
        templateName: config.UPDATE_INTERRUPT_CARD_PAGE,
      });
    }

    return res.render(config.UPDATE_INTERRUPT_CARD_PAGE, {
      backLinkUrl: getBackLinkUrl(req),
      templateName: config.UPDATE_INTERRUPT_CARD_PAGE,
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

    if (isRemove){
      return res.redirect(`${config.OVERSEAS_ENTITY_QUERY_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }
    return res.redirect(config.OVERSEAS_ENTITY_QUERY_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const getBackLinkUrl = (req: Request) => {

  try {

    const ids = getTransactionIdAndSubmissionIdFromOriginalUrl(req);

    if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || (typeof ids === "undefined")) {
      return config.SECURE_UPDATE_FILTER_URL;
    }
    return getUrlWithTransactionIdAndSubmissionId(
      config.SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
      ids[config.ROUTE_PARAM_TRANSACTION_ID],
      ids[config.ROUTE_PARAM_SUBMISSION_ID]
    );
  } catch (error) {
    logger.errorRequest(req, error);
    return config.SECURE_UPDATE_FILTER_URL;
  }
};
