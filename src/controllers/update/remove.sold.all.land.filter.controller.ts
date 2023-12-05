import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model";
import { HasSoldLandKey } from "../../model/data.types.model";
import { getApplicationData, setExtraData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: `${config.UPDATE_CONTINUE_WITH_SAVED_FILING_URL}${config.JOURNEY_REMOVE_QUERY_PARAM}`,
      templateName: config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE,
      [HasSoldLandKey]: appData?.[HasSoldLandKey]
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
    const hasSoldLand = req.body["disposed_all_land"];
    setExtraData(req.session, { ...getApplicationData(req.session), [HasSoldLandKey]: hasSoldLand });

    if (hasSoldLand === '1') {
      return res.redirect(`${config.REMOVE_IS_ENTITY_REGISTERED_OWNER_PAGE}${config.JOURNEY_REMOVE_QUERY_PARAM}`);
    }

    return res.redirect(config.REMOVE_CANNOT_USE_URL);
  } catch (error) {
    next(error);
  }
};
