import { Request, Response, NextFunction } from 'express';

import { logger } from '../../utils/logger';
import { SOLD_LAND_FILTER_URL } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { checkEntityDetailsEntered, NavigationErrorMessage } from './check.condition';

export const hasEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ( !checkEntityDetailsEntered(await getApplicationData(req.session)) ) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
