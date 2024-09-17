import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkBOsOrMOsDetailsEnteredUpdate, NavigationErrorMessage } from '../check.condition';
import { ApplicationData } from 'model';

export const hasBOsOrMOsUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);

    if (!(appData.update?.no_change || checkBOsOrMOsDetailsEnteredUpdate(appData))) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SECURE_UPDATE_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
