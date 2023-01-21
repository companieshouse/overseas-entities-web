import { Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { logger } from '../utils/logger';
import { isOENumberValid } from '../utils/oe.number.validator';
import { getApplicationData } from "../utils/application.data";
import { ApplicationData } from "../model";
import { OeNumberKey } from "../model/data.types.model";

import {
  CHS_URL,
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

export const companyAuthentication = (req: Request, res: Response, next: NextFunction) => {

  logger.debugRequest(req, `COMPANY AUTHENTICATION REQUEST`);

  const appData: ApplicationData = getApplicationData(req.session);

  const oeNumber: string = appData?.[OeNumberKey] as string;
  const returnUrl = OVERSEAS_ENTITY_QUERY_URL;

  if (!isOENumberValid(oeNumber)) {
    logger.errorRequest(req, "The OE Number selected : " + oeNumber + " is Not Valid ");

    return res.redirect(`/signin?return_to=${returnUrl}`);
  }


  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl,
    companyNumber: oeNumber
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
