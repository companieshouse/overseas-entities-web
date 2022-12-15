import { NextFunction, Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "model";
import { getApplicationData } from "../../utils/application.data";
import { Session } from "@companieshouse/node-session-handler";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE}`);

    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    const backLinkUrl: string = config.CONFIRM_OVERSEAS_COMPANY_PROFILES_URL;

    return res.render(config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE, {
      templateName: config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE,
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
    logger.debugRequest(req, `POST ${config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE}`);

    // return res.redirect(config.); //redirect to update overseas entity page
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
