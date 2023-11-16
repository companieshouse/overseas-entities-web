import { NextFunction, Request, Response } from "express";

import * as config from "../../config";
import { logger } from "../../utils/logger";
import { isRemoveJourney } from "../../utils/url";
import { JourneyType, JOURNEY_QUERY_PARAM } from "../../model/data.types.model";

export const get = (req: Request, res: Response, _: NextFunction) => {
  logger.debugRequest(req, `GET ${config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE}`);

  if (isRemoveJourney(req)){
    return res.render(config.UPDATE_CONTINUE_WITH_SAVED_FILING_PAGE, {
      journey: JourneyType.remove,
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
    return res.redirect(`${config.SOLD_ALL_LAND_FILTER_PAGE}?${JOURNEY_QUERY_PARAM}=${JourneyType.remove}`);
  }
  return res.redirect(`${config.SECURE_UPDATE_FILTER_PAGE}?start=0`);
};
