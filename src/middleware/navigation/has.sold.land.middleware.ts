import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { getRedirectUrl } from "../../utils/url";
import { ApplicationData } from 'model';
import { getApplicationData } from '../../utils/application.data';
import { checkHasSoldLandDetailsEntered, NavigationErrorMessage } from './check.condition';
import { SOLD_LAND_FILTER_URL, SOLD_LAND_FILTER_WITH_PARAMS_URL } from '../../config';

export const hasSoldLand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!checkHasSoldLandDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: SOLD_LAND_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: SOLD_LAND_FILTER_URL,
      }));
    }
    next();
  } catch (err) {
    next(err);
  }
};

