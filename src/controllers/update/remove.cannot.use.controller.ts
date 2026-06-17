import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { getRedirectUrl } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {

  try {

    logger.debugRequest(req, `GET ${config.REMOVE_CANNOT_USE_PAGE}`);

    let backLinkUrl;

    if (req.query?.[config.PREVIOUS_PAGE_QUERY_PARAM] === config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE) {
      backLinkUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.REMOVE_IS_ENTITY_REGISTERED_OWNER_URL,
      });
    } else {
      backLinkUrl = getRedirectUrl({
        req,
        urlWithEntityIds: config.REMOVE_SOLD_ALL_LAND_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: config.REMOVE_SOLD_ALL_LAND_FILTER_URL,
      });
    }

    return res.render(config.REMOVE_CANNOT_USE_PAGE, {
      backLinkUrl,
      journey: config.JourneyType.remove,
      templateName: config.REMOVE_CANNOT_USE_PAGE,
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
