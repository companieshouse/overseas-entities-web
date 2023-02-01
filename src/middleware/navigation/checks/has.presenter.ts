import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { getApplicationData } from "../../../utils/application.data";
import { checkPresenterDetailsEntered, NavigationErrorMessage } from '.././check.condition';

export const checkIfPresenterDataExists = (req: Request, res: Response, next: NextFunction, redirectUrl: string): void => {
  try {
    if ( !checkPresenterDetailsEntered(getApplicationData(req.session)) ) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(redirectUrl);
    }
    next();
  } catch (err) {
    next(err);
  }
};
