import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData, setExtraData } from "../../utils/application.data";
import { OwnedLandKey } from "../../model/owned.land.filter.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OWNED_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OWNED_LAND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_INTERRUPT_CARD_PAGE,
      templateName: config.OWNED_LAND_FILTER_PAGE,
      [OwnedLandKey]: appData[OwnedLandKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OWNED_LAND_FILTER_PAGE}`);
    const whoIsRegisteringKey = req.body[OwnedLandKey];

    setExtraData(req.session, { ...getApplicationData(req.session), [OwnedLandKey]: whoIsRegisteringKey });

    return res.redirect(config.OVERSEAS_ENTITY_QUERY_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
