import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';
import { getRedirectUrl } from "../../../utils/url";
import { ApplicationData } from 'model';
import { getApplicationData } from "../../../utils/application.data";
import { checkBOsOrMOsDetailsEnteredUpdate, NavigationErrorMessage } from '../check.condition';
import { SECURE_UPDATE_FILTER_URL, SECURE_UPDATE_FILTER_WITH_PARAMS_URL } from '../../../config';

export const hasBOsOrMOsUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!(appData.update?.no_change || checkBOsOrMOsDetailsEnteredUpdate(appData))) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: SECURE_UPDATE_FILTER_URL,
      }));
    }
    next();
  } catch (err) {
    next(err);
  }
};
