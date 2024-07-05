import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { OVERSEAS_ENTITY_QUERY_URL, SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkOverseasEntityNumberEntered, checkHasOverseasEntity, checkHasDateOfCreation, NavigationErrorMessage } from '../check.condition';

export const hasOverseasEntityNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!checkOverseasEntityNumberEntered(await getApplicationData(req.session))) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SECURE_UPDATE_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const hasOverseasEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData = await getApplicationData(req.session);
    if (!checkOverseasEntityNumberEntered(appData) && !checkHasOverseasEntity(appData) || !checkHasDateOfCreation(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(OVERSEAS_ENTITY_QUERY_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
