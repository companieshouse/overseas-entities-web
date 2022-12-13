import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";


export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const backLinkUrl: string = config.OVERSEAS_ENTITY_QUERY_URL;
    return res.render(config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE, {
      templateName: config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE,
      backLinkUrl,
      appData
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.UPDATE_OVERSEAS_ENTITY_DETAILS_PAGE}`);

    // return res.redirect(config.); //where to redirect?
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
