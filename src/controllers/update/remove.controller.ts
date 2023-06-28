import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { Session } from "@companieshouse/node-session-handler";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const appData: ApplicationData = getApplicationData(session);
    return res.render(config.UPDATE_REMOVE_PAGE, {
      company: appData.entity_name
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.redirect(config.UPDATE_FILING_DATE_URL);
  } catch (errors) {
    logger.errorRequest(req, errors);
    next(errors);
  }
};
