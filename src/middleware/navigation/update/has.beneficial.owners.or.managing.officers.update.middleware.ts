import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkBOsOrMOsDetailsEnteredUpdate, NavigationErrorMessage } from '../check.condition';
import { ApplicationData } from 'model';

export const hasBOsOrMOsUpdate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const appData: ApplicationData = getApplicationData(req.session);
    // if (!checkBOsOrMOsDetailsEnteredUpdate(appData) && !appData.update?.no_change) {
    if (!(appData.update?.no_change || checkBOsOrMOsDetailsEnteredUpdate(appData))) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SECURE_UPDATE_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
