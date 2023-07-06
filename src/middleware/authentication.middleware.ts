import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import {
  UPDATE_LANDING_URL,
  SOLD_LAND_FILTER_URL,
  RESUME,
  STARTING_NEW_URL,
  SECURE_UPDATE_FILTER_URL,
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

      // let returnUrl = SOLD_LAND_FILTER_URL;

      // if (req.path === STARTING_NEW_URL || req.path.endsWith(`/${RESUME}`) || req.path === UPDATE_CONTINUE_WITH_SAVED_FILING_URL) {
      //   returnUrl = req.path;
      // } else if (req.path.startsWith(UPDATE_LANDING_URL)) {
      //   returnUrl = SECURE_UPDATE_FILTER_URL;
      // }

      const returnToUrl = getReturnToUrl(req.path); // , referringPageURL);

      return res.redirect(`/signin-TEST?return_to=${returnToUrl}`);
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

function getReturnToUrl(path: string) { // }, referringPageURL: string) {

  let returnToUrl = SOLD_LAND_FILTER_URL;

  if (path === STARTING_NEW_URL || path.endsWith(`/${RESUME}`) || path === UPDATE_CONTINUE_WITH_SAVED_FILING_URL) {
    returnToUrl = path;
  } else if (path.startsWith(UPDATE_LANDING_URL)) {
    returnToUrl = SECURE_UPDATE_FILTER_URL;
  }

  return returnToUrl;

  // let returnToUrl: string = pageURLs.EXTENSIONS;
  // if (!activeFeature(process.env.ACCESSIBILITY_TEST_MODE)) {
  //   if (isDownloadUrl(originalUrl)) {
  //     // User has come here from clicking a download link

  //     // This subterfuge is to satisfy a reported Sonar security vulnerability - the fact that this is a relative
  //     // URL and has already been checked by the 'isDownloadUrl()' function also ensures that it is safe
  //     const ALLOWED_DOWNLOAD_URL = {};
  //     ALLOWED_DOWNLOAD_URL[originalUrl] = originalUrl;

  //     returnToUrl = ALLOWED_DOWNLOAD_URL[originalUrl];
  //   } else if (referringPageURL.endsWith(pageURLs.EXTENSIONS)) {
  //     // User has come here from the start page - company number page is next, immediately after sign-in
  //     returnToUrl = pageURLs.EXTENSIONS_COMPANY_NUMBER;
  //   }
  // }

  // return returnToUrl;
}