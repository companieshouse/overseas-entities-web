import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";
import { isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);

    if (isRemove) {
      return res.render(config.UPDATE_INTERRUPT_CARD_PAGE, {
        journey: config.JourneyType.remove,
        backLinkUrl: (isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_TRUSTS) ? config.SECURE_UPDATE_FILTER_URL : config.UPDATE_ANY_TRUSTS_INVOLVED_URL) + config.JOURNEY_REMOVE_QUERY_PARAM,
        templateName: config.UPDATE_INTERRUPT_CARD_PAGE,
      });
    }

    return res.render(config.UPDATE_INTERRUPT_CARD_PAGE, {
      backLinkUrl: isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_TRUSTS) ? config.SECURE_UPDATE_FILTER_URL : config.UPDATE_ANY_TRUSTS_INVOLVED_URL,
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
