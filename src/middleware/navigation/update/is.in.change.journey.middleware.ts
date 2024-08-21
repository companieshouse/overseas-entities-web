import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { NavigationErrorMessage } from '../check.condition';
import { isNoChangeJourney } from "../../../utils/update/no.change.journey";

export const isInChangeJourney = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const appData = getApplicationData(req.session);

    const inChangeJourney = !isNoChangeJourney(appData);

    if (inChangeJourney) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};
