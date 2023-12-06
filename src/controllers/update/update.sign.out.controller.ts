import { NextFunction, Request, Response } from "express";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import * as config from "../../config";
import { isActiveFeature } from "../../utils/feature.flag";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.render(config.UPDATE_SIGN_OUT_PAGE, {
      previousPage: `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`,
      url: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
      saveAndResume: isActiveFeature(config.FEATURE_FLAG_ENABLE_UPDATE_SAVE_AND_RESUME),
      journey: config.JourneyType.update
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
    // TODO include previousPage in url for remove-cannot-use back link
    // have a previousPageBackLink in the body and if not undefined or null add it to the redirect to previousPage
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
