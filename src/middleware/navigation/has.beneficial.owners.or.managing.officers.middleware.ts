import { NextFunction, Request, Response } from 'express';
import { ApplicationData } from 'model';
import { SOLD_LAND_FILTER_URL } from '../../config';
import { logger } from '../../utils/logger';
import { checkBOsOrMOsDetailsEntered, NavigationErrorMessage } from './check.condition';
import { getApplicationData } from '../../utils/application.data';

export const hasBOsOrMOs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req, true);
    if (!checkBOsOrMOsDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
