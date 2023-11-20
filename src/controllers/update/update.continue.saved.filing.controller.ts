import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { isRemoveJourney } from "../../utils/url";

export const get = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `GET ${config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE}`);

  if (isRemoveJourney(req)){
    return res.render(config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl: config.REMOVE_LANDING_PAGE_URL,
      templateName: config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE
    });
  }

  return res.render(config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE, {
    templateName: config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE
  });
};

export const post = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `POST ${config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE}`);

  if (req.body["continue_saved_filing"] === 'yes') {
    return res.redirect(config.YOUR_FILINGS_PATH);
  }

  if (isRemoveJourney(req)){
    return res.redirect(`${config.REMOVE_SOLD_ALL_LAND_FILTER_PAGE}`);
  }

  return res.redirect(`${config.SECURE_UPDATE_FILTER_PAGE}?start=0`);
};
