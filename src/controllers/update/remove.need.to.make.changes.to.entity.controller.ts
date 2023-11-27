import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_NEED_MAKE_CHANGES_PAGE}`);
    return res.render(config.REMOVE_NEED_MAKE_CHANGES_PAGE, {
      journey: config.JourneyType.remove,
      // TODO set back link to be Who can we contact about this application?
      backLinkUrl: `${config.UPDATE_LANDING_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
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
      // TODO redirect to Who is completing this update? page
      return res.redirect(config.WHO_IS_MAKING_UPDATE_URL);
    } else if (req.body["make_changes"] === "no") {
      // TODO redirect to Has the overseas entity identified all its registrable beneficial owners?
      return res.redirect(config.UPDATE_LANDING_URL);
    }
  } catch (error) {
    next(error);
  }
};
