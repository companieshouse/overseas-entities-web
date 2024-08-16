import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { NavigationErrorMessage } from '../check.condition';
import { isActiveFeature } from "../../../utils/feature.flag";
import * as config from "../../../config";
import { checkRelevantPeriod } from "../../../utils/relevant.period";

export const isInChangeJourney = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const appData = getApplicationData(req.session);

    const relevantPeriodNoChange = isActiveFeature(config.FEATURE_FLAG_ENABLE_RELEVANT_PERIOD) ? !checkRelevantPeriod(appData) : true;

    const inChangeJourney = !appData.update?.no_change || !relevantPeriodNoChange;

    if (inChangeJourney) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};
