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
      registrationDate: update.date_of_creation
    });
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.CONFIRM_OVERSEAS_ENTITY_DETAILS_PAGE}`);
    return res.redirect(config.OVERSEAS_ENTITY_PRESENTER_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
