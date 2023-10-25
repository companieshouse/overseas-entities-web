import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { SOLD_LAND_FILTER_URL, SECURE_UPDATE_FILTER_URL, ROUTE_PARAM_TRUST_ID } from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from '../../model/application.model';
import { TrustKey } from '../../model/trust.model';
import { NavigationErrorMessage } from './check.condition';
import { containsTrustData, getTrustArray } from '../../utils/trusts';

const hasTrustWithId = (req: Request, res: Response, next: NextFunction, url: string): void => {
  try {
    const trustId = req.params[ROUTE_PARAM_TRUST_ID];
    const appData: ApplicationData = getApplicationData(req.session);

    const isTrustPresent = appData[TrustKey]?.some(
      (trust) => trust.trust_id === trustId,
    );
    if (!isTrustPresent) {
      logger.infoRequest(req, NavigationErrorMessage);

      return res.redirect(url);
    }

    return next();
  } catch (err) {
    next(err);
  }
};

const hasTrustData = (req: Request, res: Response, next: NextFunction, url: string): void => {
  try {
    const appData: ApplicationData = getApplicationData(req.session);
    if (containsTrustData(getTrustArray(appData))) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(url);
  } catch (err) {
    next(err);
  }
};

export const hasTrustWithIdRegister = (req: Request, res: Response, next: NextFunction) => hasTrustWithId(req, res, next, SOLD_LAND_FILTER_URL);
export const hasTrustDataRegister = (req: Request, res: Response, next: NextFunction) => hasTrustData(req, res, next, SOLD_LAND_FILTER_URL);
export const hasTrustWithIdUpdate = (req: Request, res: Response, next: NextFunction) => hasTrustWithId(req, res, next, SECURE_UPDATE_FILTER_URL);
export const hasTrustDataUpdate = (req: Request, res: Response, next: NextFunction) => hasTrustData(req, res, next, SECURE_UPDATE_FILTER_URL);
