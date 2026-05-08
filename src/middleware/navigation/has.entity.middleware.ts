import { NextFunction, Request, Response } from 'express';
import { ApplicationData } from 'model';
import { SOLD_LAND_FILTER_URL } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { logger } from '../../utils/logger';
import { checkEntityDetailsEntered, NavigationErrorMessage } from './check.condition';

export const hasEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!checkEntityDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
