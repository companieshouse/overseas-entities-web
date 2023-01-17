import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { deleteApplicationData, getApplicationData, setExtraData } from "../utils/application.data";
import { HasSoldLandKey, LANDING_PAGE_QUERY_PARAM } from "../model/data.types.model";
import { isActiveFeature } from "../utils/feature.flag";
import { FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022 } from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SOLD_LAND_FILTER_PAGE}`);

    if (req.query[LANDING_PAGE_QUERY_PARAM] === '0') {
      deleteApplicationData(req.session);
    }

    const appData: ApplicationData = getApplicationData(req.session);

    let backLinkUrl: string = config.LANDING_PAGE_URL;
    if (isActiveFeature(FEATURE_FLAG_ENABLE_SAVE_AND_RESUME_17102022)) {
      backLinkUrl = config.LANDING_PAGE_STARTING_NEW_URL;
    }
    return res.render(config.SOLD_LAND_FILTER_PAGE, {
      backLinkUrl: backLinkUrl,
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
