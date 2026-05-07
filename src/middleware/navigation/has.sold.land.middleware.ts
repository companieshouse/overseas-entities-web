import { NextFunction, Request, Response } from 'express';

import { ApplicationData } from 'model';
import { SOLD_LAND_FILTER_URL } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { logger } from '../../utils/logger';
import { checkHasSoldLandDetailsEntered, NavigationErrorMessage } from './check.condition';

export const hasSoldLand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!checkHasSoldLandDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};

