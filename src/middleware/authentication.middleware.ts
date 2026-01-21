import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getRedirectUrl } from "../utils/url";
import { checkUserSignedIn, getLoggedInUserEmail } from "../utils/session";

import {
  JourneyType,
  RESUME,
  STARTING_NEW_URL,
  UPDATE_LANDING_URL,
  JOURNEY_QUERY_PARAM,
  SOLD_LAND_FILTER_URL,
  SECURE_UPDATE_FILTER_URL,
  JOURNEY_REMOVE_QUERY_PARAM,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  SOLD_LAND_FILTER_WITH_PARAMS_URL,
  SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
  UPDATE_CONTINUE_WITH_SAVED_FILING_URL,
} from '../config';

export const authentication = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkUserSignedIn(req.session)) {
      logger.infoRequest(req, 'User not authenticated, redirecting to sign in page, status_code=302');
      const returnToUrl = getReturnToUrl(req);
      return res.redirect(`/signin?return_to=${returnToUrl}`);
    }
    const userEmail = getLoggedInUserEmail(req.session);
    logger.infoRequest(req, `User (${ userEmail }) is signed in`);
    // Using the https://expressjs.com/en/5x/api.html#res.locals to make sure that the email
    // is available within a single request-response cycle and visible in the template.
    res.locals.userEmail = userEmail;
    next();
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};

function getReturnToUrl(req: Request) {

  let returnToUrl = getRedirectUrl({
    req,
    urlWithEntityIds: SOLD_LAND_FILTER_WITH_PARAMS_URL,
    urlWithoutEntityIds: SOLD_LAND_FILTER_URL,
  });

  const path = req.path;

  if (path === STARTING_NEW_URL || path.endsWith(`/${RESUME}`) || path === UPDATE_CONTINUE_WITH_SAVED_FILING_URL) {
    if (!path.startsWith(REGISTER_AN_OVERSEAS_ENTITY_URL) && !path.startsWith(UPDATE_AN_OVERSEAS_ENTITY_URL)) {
      throw new Error('Security failure with the path URL ' + path);
    }

    returnToUrl = path;

    if (req.query[JOURNEY_QUERY_PARAM] === JourneyType.remove) {
      // Ensure that user is placed on the Remove (not Update) journey after logging in by re-adding the 'journey=remove'
      // URL query parameter and note that the URL now needs to encoded due to the presence of the additional '?'
      returnToUrl = encodeURIComponent(returnToUrl + JOURNEY_REMOVE_QUERY_PARAM);
    }
  } else if (path.startsWith(UPDATE_LANDING_URL)) {
    returnToUrl = getRedirectUrl({
      req,
      urlWithEntityIds: SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
      urlWithoutEntityIds: SECURE_UPDATE_FILTER_URL,
    });
  }

  logger.debug("returnToUrl is " + returnToUrl);

  return returnToUrl;
}
