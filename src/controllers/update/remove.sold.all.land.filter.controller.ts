import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `GET ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);

  return res.render(config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE, {
    journey: config.JourneyType.remove,
    backLinkUrl: `${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    templateName: config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE
  });
};

export const post = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `POST ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);

  if (req.body["disposed_all_land"] === 'yes') {
    return res.redirect(config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE);
  }

  return res.redirect(config.REMOVE_UNALLOWED);
};
