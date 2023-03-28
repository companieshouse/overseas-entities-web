import { NextFunction, Request, Response } from "express";
import { ApplicationData } from "../../model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { getApplicationData } from "../../utils/application.data";
import { Update } from "model/update.type.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);
    const update = appData.update as Update;

    return res.render(config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE, {
      backLinkUrl: config.OVERSEAS_ENTITY_QUERY_URL,
      updateUrl: config.UPDATE_OVERSEAS_ENTITY_CONFIRM_URL,
      templateName: config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE,
      appData,
      registrationDate: update.date_of_creation?.year + '-' + update.date_of_creation?.month + '-' + update.date_of_creation?.day
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

