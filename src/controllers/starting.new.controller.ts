import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `GET ${config.STARTING_NEW_PAGE}`);

  return res.render(config.STARTING_NEW_PAGE, {
    backLinkUrl: config.LANDING_PAGE_URL,
    templateName: config.STARTING_NEW_PAGE
  });
};

export const post = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `POST ${config.STARTING_NEW_PAGE}`);

  if (req.body["continue_saved_application"] === 'yes') {
    return res.redirect(config.YOUR_FILINGS_PATH);
  }

  return res.redirect(`${config.SOLD_LAND_FILTER_URL}?start=0`);
};
