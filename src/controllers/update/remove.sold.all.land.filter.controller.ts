import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { HasSoldAllLandKey } from "../../model/data.types.model";
import { getApplicationData, getRemove, setApplicationData } from "../../utils/application.data";
import { RemoveKey } from "../../model/remove.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    const remove = appData?.[RemoveKey];
    return res.render(config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE,
      [HasSoldAllLandKey]: remove?.[HasSoldAllLandKey]
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
    const hasSoldAllLand = req.body[HasSoldAllLandKey];

    const appData: ApplicationData = getApplicationData(req.session);
    const remove = getRemove(appData);

    remove[HasSoldAllLandKey] = hasSoldAllLand ;

    setApplicationData(req.session, remove, RemoveKey);

    if (hasSoldAllLand === config.BUTTON_OPTION_YES) {
      return res.redirect(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }

    return res.redirect(`${config.REMOVE_CANNOT_USE_URL}?${config.PREVIOUS_PAGE_QUERY_PARAM}=${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
  } catch (error) {
    next(error);
  }
};
