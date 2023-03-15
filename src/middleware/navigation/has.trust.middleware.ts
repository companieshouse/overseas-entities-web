import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { SOLD_LAND_FILTER_URL, ROUTE_PARAM_TRUST_ID } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from '../../model/application.model';
import { TrustKey } from '../../model/trust.model';
import { NavigationErrorMessage } from './check.condition';
import { containsTrustData, getTrustArray } from '../../utils/trusts';

export const hasTrustWithId = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const trustId = req.params[ROUTE_PARAM_TRUST_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const isTrustPresent = appData[TrustKey]?.some(
      (trust) => trust.trust_id === trustId,
    );

    if (!isTrustPresent) {
      logger.infoRequest(req, NavigationErrorMessage);

      return res.redirect(SOLD_LAND_FILTER_URL);
    }

    return next();
  } catch (err) {
    next(err);
  }
};

export const hasTrustData = (req: Request, res: Response, next: NextFunction): void => {
  try {

    const appData: ApplicationData = getApplicationData(req.session);
    if (containsTrustData(getTrustArray(appData))) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SOLD_LAND_FILTER_URL);
  } catch (err) {
    next(err);
  }
};
