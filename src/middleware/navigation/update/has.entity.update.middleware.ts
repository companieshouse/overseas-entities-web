import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { UPDATE_LANDING_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkEntityUpdateDetailsEntered, NavigationErrorMessage } from '../check.condition';

export const hasEntityUpdateDetails = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkEntityUpdateDetailsEntered(getApplicationData(req.session)) ) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(UPDATE_LANDING_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
