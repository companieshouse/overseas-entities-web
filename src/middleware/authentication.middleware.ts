import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import {
  UPDATE_LANDING_URL,
  SOLD_LAND_FILTER_URL,
  REGISTER_AN_OVERSEAS_ENTITY_URL,
  RESUME,
  STARTING_NEW_URL,
  SECURE_UPDATE_FILTER_URL,
  UPDATE_AN_OVERSEAS_ENTITY_URL,
  UPDATE_CONTINUE_WITH_SAVED_FILING_URL
} from '../config';

import {
  checkUserSignedIn,
  getLoggedInUserEmail
} from "../utils/session";

export const authentication = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkUserSignedIn(req.session)) {
      logger.infoRequest(req, 'User not authenticated, redirecting to sign in page, status_code=302');

      const returnToUrl = getReturnToUrl(req.path);

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

function getReturnToUrl(path: string) {
  let returnToUrl = SOLD_LAND_FILTER_URL;

  if (path === STARTING_NEW_URL || path.endsWith(`/${RESUME}`) || path === UPDATE_CONTINUE_WITH_SAVED_FILING_URL) {
    if (!path.startsWith(REGISTER_AN_OVERSEAS_ENTITY_URL) && !path.startsWith(UPDATE_AN_OVERSEAS_ENTITY_URL)) {
      throw new Error('Security failure with the path URL ' + path);
    }

    returnToUrl = path;
  } else if (path.startsWith(UPDATE_LANDING_URL)) {
    returnToUrl = SECURE_UPDATE_FILTER_URL;
  }

  return returnToUrl;
}
