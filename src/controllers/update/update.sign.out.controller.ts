import { NextFunction, Request, Response } from "express";
import { createAndLogErrorRequest, logger } from "../../utils/logger";
import * as config from "../../config";
import { getPreviousPageUrl, isRemoveJourney } from "../../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let journey = config.JourneyType.update;
  let previousPage = `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}${req.query["page"]}`;
  const isRemove: boolean = await isRemoveJourney(req);

  if (isRemove) {
    journey = config.JourneyType.remove;
    // some sign-out back links don't work if just using the template name, some need other path structures and query params
    // so use the same approach as the Registration journey and get the previous page url from the request headers
    previousPage = getPreviousPageUrl(req, config.UPDATE_AN_OVERSEAS_ENTITY_URL);
  }

  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    return res.render(config.UPDATE_SIGN_OUT_PAGE, {
      previousPage,
      url: config.UPDATE_AN_OVERSEAS_ENTITY_URL,
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
