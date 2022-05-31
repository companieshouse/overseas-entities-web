import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';
import { PRESENTER_URL } from '../config';

import {
  checkUserSignedIn,
  getLoggedInUserEmail
} from "../utils/session";

export const authentication = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkUserSignedIn(req.session)) {
      logger.infoRequest(req, 'User not authenticated, redirecting to sign in page, status_code=302');
      return res.redirect(`/signin?return_to=${PRESENTER_URL}`);
    }

    logger.infoRequest(req, `User (${getLoggedInUserEmail(req.session)}) is signed in`);
    next();

  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
};
