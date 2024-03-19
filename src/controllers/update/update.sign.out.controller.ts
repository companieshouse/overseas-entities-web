import { NextFunction, Request, Response } from "express";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";
import { isRemoveJourney } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    let journey = config.JourneyType.update;
    let previousPage = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`;

    if (isRemoveJourney(req)) {
      journey = config.JourneyType.remove;
      previousPage += config.JOURNEY_REMOVE_QUERY_PARAM;
    }

    return res.render(config.UPDATE_SIGN_OUT_PAGE, {
      previousPage,
      url: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
      saveAndResume: isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME),
      journey
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const previousPage = req.body["previousPage"];
    if (!previousPage.startsWith(config.UPDATE_AN_OVERSEAS_ENTITY_URL)){
      throw createAndLogErrorRequest(req, `${previousPage} page is not part of the journey!`);
    }
    if (req.body["sign_out"] === 'yes') {
      return res.redirect(config.UPDATE_ACCOUNTS_SIGN_OUT_URL);
    }
    return res.redirect(previousPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
