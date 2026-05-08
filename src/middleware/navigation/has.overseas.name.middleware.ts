import { NextFunction, Request, Response } from 'express';

import { ApplicationData } from 'model';
import { SOLD_LAND_FILTER_URL } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { logger } from '../../utils/logger';
import { checkOverseasNameDetailsEntered, NavigationErrorMessage } from './check.condition';

export const hasOverseasName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if ( !checkOverseasNameDetailsEntered(appData) ) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};

