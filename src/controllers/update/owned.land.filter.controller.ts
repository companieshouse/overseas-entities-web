import { NextFunction, Request, Response } from "express";

import { logger } from "../../utils/logger";
import * as config from "../../config";
import { ApplicationData } from "../../model";
import { getApplicationData } from "../../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.OWNED_LAND_FILTER_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.OWNED_LAND_FILTER_PAGE, {
      backLinkUrl: config.UPDATE_DO_YOU_WANT_TO_MAKE_OE_CHANGE_PAGE,
      templateName: config.OWNED_LAND_FILTER_PAGE,
      ...appData,
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
