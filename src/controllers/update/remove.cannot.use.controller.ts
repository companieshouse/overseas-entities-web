import { NextFunction, Request, Response } from "express";
import * as config from "../../config";
import { logger } from "../../utils/logger";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.SIGN_OUT_PAGE}`);

    let backLinkUrl = "";
    let signOutExtraQueryParams = "";

    const previousPage = req.query[config.PREVIOUS_PAGE_QUERY_PARAM];
    if (previousPage) {
      backLinkUrl = `${previousPage}${config.JOURNEY_REMOVE_QUERY_PARAM}`;
      signOutExtraQueryParams = `${config.PREVIOUS_PAGE_QUERY_PARAM}=${previousPage}`;
    }

    return res.render(config.REMOVE_CANNOT_USE_PAGE, {
      journey: config.JourneyType.remove,
      backLinkUrl,
      templateName: config.REMOVE_CANNOT_USE_PAGE,
      url: `${config.UPDATE_AN_OVERSEAS_ENTITY_URL}`, // used in sign-out-user-banner to build correct url for sign out page
      signOutPreviousPagePrefix: config.REMOVE_SIGN_OUT_PREFIX,
      signOutExtraQueryParams
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
