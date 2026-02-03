import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { ApplicationData } from 'model';
import { isRemoveJourney } from "../../utils/url";
import { fetchApplicationData } from "../../utils/application.data";
import { SOLD_LAND_FILTER_URL } from '../../config';
import { checkDueDiligenceDetailsEntered, NavigationErrorMessage } from './check.condition';

export const hasDueDiligence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isRemove = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    if (!checkDueDiligenceDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
