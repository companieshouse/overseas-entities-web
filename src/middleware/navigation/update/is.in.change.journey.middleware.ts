import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { NavigationErrorMessage } from '../check.condition';

export const isInChangeJourney = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData = await getApplicationData(req.session);
    const inChangeJourney = !appData.update?.no_change;

    if (inChangeJourney) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};
