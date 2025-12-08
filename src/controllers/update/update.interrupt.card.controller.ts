import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import {
  getBackLinkOrNextUrl,
  isRemoveJourney
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

    const backLinkUrl = getBackLinkOrNextUrl({
      req,
      urlWithEntityIds: config.SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
      urlWithoutEntityIds: config.SECURE_UPDATE_FILTER_URL,
    });

    return res.render(config.UPDATE_INTERRUPT_CARD_PAGE, {
      backLinkUrl,
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
