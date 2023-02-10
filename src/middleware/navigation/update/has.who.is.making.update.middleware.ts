import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkWhoIsFilingEntered, NavigationErrorMessage } from '../check.condition';

export const hasWhoIsMakingUpdate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkWhoIsFilingEntered(getApplicationData(req.session)) ) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SECURE_UPDATE_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
