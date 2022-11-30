import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import * as config from "../config";
// import { ApplicationData } from "../model";
import { deleteApplicationData, getApplicationData, setExtraData } from "../utils/application.data";
import { OeNumber, LANDING_PAGE_QUERY_PARAM } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);

    if (req.query[LANDING_PAGE_QUERY_PARAM] === '0') {
      deleteApplicationData(req.session);
    }

    // const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE, {
      backLinkUrl: config.UPDATE_LANDING_PAGE_URL,
      templateName: config.OVERSEAS_ENTITY_QUERY_PAGE
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_QUERY_PAGE}`);
    const oeNumber = req.body[OeNumber];

    setExtraData(req.session, { ...getApplicationData(req.session), [OeNumber]: oeNumber });

    if ( oeNumber.length === 8 ) {
      return res.redirect(config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL);
    } else {
      return res.render(config.OVERSEAS_ENTITY_QUERY_PAGE);
    }
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
