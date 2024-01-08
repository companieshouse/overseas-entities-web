import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";
import { ApplicationData } from "../../model/application.model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.REMOVE_CONFIRM_STATEMENT_PAGE, {
      backLinkUrl: `${config.UPDATE_REGISTRABLE_BENEFICIAL_OWNER_URL}`,
      appData
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.REMOVE_CONFIRM_STATEMENT_PAGE}`);
    return res.redirect(`${config.REMOVE_CANNOT_USE_URL}`);
  } catch (error) {
    next(error);
  }
};
