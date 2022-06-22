import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SOLD_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.SOLD_LAND_FILTER_PAGE, {
      backLinkUrl: config.LANDING_URL,
      templateName: config.SOLD_LAND_FILTER_PAGE,
      has_sold_land: appData.has_sold_land
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SOLD_LAND_FILTER_PAGE}`);
    const hasSoldLand = req.body.has_sold_land;

    setExtraData(req.session, { ...getApplicationData(req.session), has_sold_land: hasSoldLand });

    if (hasSoldLand === '1') {
      return res.redirect(config.CANNOT_USE_URL);
    } else if (hasSoldLand === '0') {
      return res.redirect(config.SECURE_REGISTER_FILTER_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
