import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_NEED_MAKE_CHANGES_PAGE}`);
    return res.render(config.REMOVE_NEED_MAKE_CHANGES_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.OVERSEAS_ENTITY_PRESENTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.REMOVE_NEED_MAKE_CHANGES_PAGE
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.REMOVE_NEED_MAKE_CHANGES_PAGE}`);
    if (req.body["make_changes"] === "yes") {
      return res.redirect(`${config.WHO_IS_MAKING_UPDATE_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    } else if (req.body["make_changes"] === "no") {
      // TODO redirect to new component Has the overseas entity identified anyregistrable beneficial owners?
      return res.redirect(config.UPDATE_LANDING_URL);
    }
  } catch (error) {
    next(error);
  }
};
