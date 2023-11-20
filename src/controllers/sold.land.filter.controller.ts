import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { deleteApplicationData, getApplicationData, setExtraData } from "../utils/application.data";
import { HasSoldLandKey } from "../model/data.types.model";
import { getSoldLandFilterBackLink } from "../utils/navigation";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SOLD_LAND_FILTER_PAGE}`);

    if (req.query[config.LANDING_PAGE_QUERY_PARAM] === '0') {
      deleteApplicationData(req.session);
    }

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.SOLD_LAND_FILTER_PAGE, {
      backLinkUrl: getSoldLandFilterBackLink(),
      templateName: config.SOLD_LAND_FILTER_PAGE,
      [HasSoldLandKey]: appData?.[HasSoldLandKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.SOLD_LAND_FILTER_PAGE}`);
    const hasSoldLand = req.body[HasSoldLandKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [HasSoldLandKey]: hasSoldLand });

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
