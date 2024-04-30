import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { OwnedLandKey } from "../../model/owned.land.filter.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_PRESENTER_PAGE,
      templateName: config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.RELEVANT_PERIOD_OWNED_LAND_FILTER_PAGE}`);
    const ownedLandKey = req.body[OwnedLandKey];
    // TODO: store ownedLandKey in ApplicationData and turn on questions about the relevant period.

    if (ownedLandKey === '1') {
      return res.redirect(config.RELEVANT_PERIOD_OWNED_LAND_FILTER_URL); // currently redirects to itself because next page is not built
    } else if (ownedLandKey === '0') {
      return res.redirect(config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_URL);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
