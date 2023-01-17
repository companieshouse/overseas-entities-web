import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import {
  UPDATE_LANDING_URL,
  SOLD_LAND_FILTER_URL,
  OVERSEAS_ENTITY_QUERY_URL,
  RESUME,
  STARTING_NEW_URL
} from '../config';

import {
  checkUserSignedIn,
  getLoggedInUserEmail
} from "../utils/session";

export const authentication = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkUserSignedIn(req.session)) {
      logger.infoRequest(req, 'User not authenticated, redirecting to sign in page, status_code=302');

      let returnUrl = SOLD_LAND_FILTER_URL;

      if (req.path.startsWith(UPDATE_LANDING_URL)) {
        returnUrl = OVERSEAS_ENTITY_QUERY_URL;
      } else if (req.path === STARTING_NEW_URL || req.path.endsWith(`/${RESUME}`)) {
        returnUrl = req.path;
      }

      return res.redirect(`/signin?return_to=${returnUrl}`);
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
