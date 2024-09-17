import { Request, Response, NextFunction } from 'express';

import { logger } from '../../utils/logger';
import { SOLD_LAND_FILTER_URL } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { checkOverseasNameDetailsEntered, NavigationErrorMessage } from './check.condition';
import { ApplicationData } from 'model';

export const hasOverseasName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);

    if ( !checkOverseasNameDetailsEntered(appData) ) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};

