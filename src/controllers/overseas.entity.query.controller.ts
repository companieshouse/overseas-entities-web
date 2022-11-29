import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData } from "../model";
import { deleteApplicationData, getApplicationData } from "../utils/application.data";
import { HasSoldLandKey, LANDING_PAGE_QUERY_PARAM } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);

    if (req.query[LANDING_PAGE_QUERY_PARAM] === '0') {
      deleteApplicationData(req.session);
    }

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE,
      [HasSoldLandKey]: appData?.[HasSoldLandKey]
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
