import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { fetchApplicationData } from "../../utils/application.data";
import { ApplicationData } from 'model';
import { isRegistrationJourney } from "../../utils/url";
import { checkEntityDetailsEntered, NavigationErrorMessage } from './check.condition';
import { SOLD_LAND_FILTER_URL } from '../../config';

export const hasEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    if (!checkEntityDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SOLD_LAND_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
