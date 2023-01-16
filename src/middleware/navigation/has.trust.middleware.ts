import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { SOLD_LAND_FILTER_URL, ROUTE_PARAM_TRUST_ID } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from '../../model/application.model';
import { TrustKey } from '../../model/trust.model';
import { NavigationErrorMessage } from './check.condition';

export const hasTrust = (req: Request, res: Response, next: NextFunction): void => {
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
