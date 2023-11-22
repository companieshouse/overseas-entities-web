import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `GET ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);

  return res.render(config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE, {
    journey: config.JourneyType.remove,
    backLinkUrl: `${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
    templateName: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE
  });
};

export const post = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `POST ${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}`);
  if (req.body["owner_disposed"] === 'no') {
    return res.redirect(`${config.SECURE_UPDATE_FILTER_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
  }
  return res.redirect(config.REMOVE_CANNOT_USE_URL);
};
