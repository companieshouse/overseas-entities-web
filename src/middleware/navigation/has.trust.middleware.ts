import { NextFunction, Request, Response } from 'express';
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from '../../model/application.model';
import { TrustKey } from '../../model/trust.model';
import { NavigationErrorMessage } from './check.condition';
import { TrusteeType } from '../../model/trustee.type.model';
import { getRedirectUrl } from "../../utils/url";
import { createAndLogErrorRequest, logger } from '../../utils/logger';
import { containsTrustData, getTrustArray } from '../../utils/trusts';

import {
  SOLD_LAND_FILTER_URL,
  ROUTE_PARAM_TRUST_ID,
  ROUTE_PARAM_TRUSTEE_ID,
  SECURE_UPDATE_FILTER_URL,
  ROUTE_PARAM_TRUSTEE_TYPE,
  SOLD_LAND_FILTER_WITH_PARAMS_URL,
  SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
} from '../../config';

const hasTrustWithId = async (req: Request, res: Response, next: NextFunction, url: string): Promise<void> => {
  try {
    const trustId = req.params[ROUTE_PARAM_TRUST_ID];
    const appData: ApplicationData = await getApplicationData(req);
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

const hasTrusteeWithId = async (req: Request, res: Response, next: NextFunction, url: string): Promise<void> => {

  try {

    const trustId = req.params[ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trusteeType = req.params[ROUTE_PARAM_TRUSTEE_TYPE];
    const appData: ApplicationData = await getApplicationData(req);
    const isTrustPresent = appData[TrustKey]?.some(
      (trust) => trust.trust_id === trustId,
    );

    if (!isTrustPresent) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(url);
    }

    let hasTrusteeForChange = false;

    if (trusteeId && trusteeType) {
      switch (trusteeType as TrusteeType){
          case TrusteeType.HISTORICAL:
            hasTrusteeForChange = (appData[TrustKey]?.find(t => t.trust_id === trustId)?.HISTORICAL_BO ?? []).some(t => t.id === trusteeId);
            break;
          case TrusteeType.INDIVIDUAL:
            hasTrusteeForChange = (appData[TrustKey]?.find(t => t.trust_id === trustId)?.INDIVIDUALS ?? []).some(t => t.id === trusteeId);
            break;
          case TrusteeType.LEGAL_ENTITY:
            hasTrusteeForChange = (appData[TrustKey]?.find(t => t.trust_id === trustId)?.CORPORATES ?? []).some(t => t.id === trusteeId);
            break;
          default:
            throw createAndLogErrorRequest(req, "Invalid trustee type");
      }
    }

    if (!hasTrusteeForChange) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(url);
    }

    return next();

  } catch (err) {
    next(err);
  }
};

const hasTrustData = async (req: Request, res: Response, next: NextFunction, url: string): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (containsTrustData(getTrustArray(appData))) {
      return next();
    }
    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(url);
  } catch (err) {
    next(err);
  }
};

const getSoldLandFilterUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: SOLD_LAND_FILTER_WITH_PARAMS_URL,
    urlWithoutEntityIds: SOLD_LAND_FILTER_URL,
  });
};

const getSecureUpdateFilterUrl = (req: Request) => {
  return getRedirectUrl({
    req,
    urlWithEntityIds: SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
    urlWithoutEntityIds: SECURE_UPDATE_FILTER_URL,
  });
};
export const hasTrustWithIdRegister = (req: Request, res: Response, next: NextFunction) => hasTrustWithId(req, res, next, getSoldLandFilterUrl(req));
export const hasTrustDataRegister = (req: Request, res: Response, next: NextFunction) => hasTrustData(req, res, next, getSoldLandFilterUrl(req));
export const hasTrustWithIdUpdate = (req: Request, res: Response, next: NextFunction) => hasTrustWithId(req, res, next, getSecureUpdateFilterUrl(req));
export const hasTrustDataUpdate = (req: Request, res: Response, next: NextFunction) => hasTrustData(req, res, next, getSecureUpdateFilterUrl(req));
export const hasTrusteeWithIdUpdate = (req: Request, res: Response, next: NextFunction) => hasTrusteeWithId(req, res, next, getSecureUpdateFilterUrl(req));
