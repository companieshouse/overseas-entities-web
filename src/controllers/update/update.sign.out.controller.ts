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

      const removeJourneyQueryParam = `${config.JOURNEY_QUERY_PARAM}=${config.JourneyType.remove}`;

      // we want to copy any query params (minus the 'page' param) and add them to the url that will take us to the previous page.
      // This is so we can render the previous page with the params it needs

      // Create an array to hold the query parameters
      const queryParams: string[] = [];
      // populate the array with the query params
      for (const param in req.query) {
        // we don't want to include the 'page' param that was used to tell this controller where to return to
        if (param === "page") {
          continue;
        }
        if (Object.prototype.hasOwnProperty.call(req.query, param)) {
          queryParams.push(`${param}=${req.query[param]}`);
        }
      }

      // Add the removeJourneyQueryParam if it's not already in the query string
      if (!queryParams.includes(removeJourneyQueryParam)) {
        queryParams.unshift(removeJourneyQueryParam);
      }

      // Join the query parameters with '&' and prepend with '?'
      const newQueryString = '?' + queryParams.join('&');
      // add the query params to the url for the previous page
      previousPage += newQueryString;
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
