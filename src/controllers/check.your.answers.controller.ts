import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData } from "../model";
import { getApplicationData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ${config.CHECK_YOUR_ANSWERS_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.CHECK_YOUR_ANSWERS_PAGE, {
      backLinkUrl: config.MANAGING_OFFICER_CORPORATE_URL,
      appData
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
