import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ContinueSavedKey } from "../model/data.types.model";
import { ApplicationData } from "../model";
import { getApplicationData, setExtraData } from "../utils/application.data";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.STARTING_NEW_PAGE}`);
    const appData: ApplicationData = getApplicationData(req.session);
    return res.render(config.STARTING_NEW_PAGE, {
      backLinkUrl: config.LANDING_PAGE_URL,
      templateName: config.STARTING_NEW_PAGE,
      [ContinueSavedKey]: appData?.[ContinueSavedKey]
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.STARTING_NEW_PAGE}`);
    const continueSaved = req.body[ContinueSavedKey];
    setExtraData(req.session, { ...getApplicationData(req.session), [ContinueSavedKey]: continueSaved });

    if (continueSaved === '1') {
      return res.redirect(config.YOUR_FILINGS_PATH);
    }

    return res.redirect(`${config.SOLD_LAND_FILTER_URL}?start=0`);
  } catch (error) {
    next(error);
  }
};
