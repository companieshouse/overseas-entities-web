import { NextFunction, Request, Response } from "express";

import { logger } from "../../../utils/logger";
import { NavigationErrorMessage } from "../check.condition";
import { ROUTE_PARAM_TRUSTEE_ID, SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getTrustInReview, getTrusteeIndex, hasTrusteesToReview, hasTrustsToReview } from "../../../utils/update/review_trusts";
import { getApplicationData } from "../../../utils/application.data";
import { TrusteeType } from "../../../model/trustee.type.model";
import { ApplicationData } from "model";

export const reviewTheTrustGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);

    if (hasTrustsToReview(appData)) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};

const reviewTrusteesGuard = async (req: Request, res: Response, next: NextFunction, trusteeType: TrusteeType): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);
    const trustInReview = getTrustInReview(appData);
    const hasTrusteesForReview = hasTrusteesToReview(trustInReview, trusteeType);

    if (hasTrusteesForReview) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};

const tellUsAboutTrusteesGuard = async (req: Request, res: Response, next: NextFunction, trusteeType: TrusteeType): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);
    const trustInReview = getTrustInReview(appData);
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];

    if (trustInReview) {
      if (trusteeId) {
        if (getTrusteeIndex(trustInReview, trusteeId, trusteeType) < 0) {
          logger.infoRequest(req, NavigationErrorMessage);
          return res.redirect(SECURE_UPDATE_FILTER_URL);
        }
      }
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};

export const manageTrustsReviewFormerBOsGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
  await reviewTrusteesGuard(req, res, next, TrusteeType.HISTORICAL);

export const manageTrustsReviewIndividualsGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
  await reviewTrusteesGuard(req, res, next, TrusteeType.INDIVIDUAL);

export const manageTrustsReviewLegalEntitiesGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
  await reviewTrusteesGuard(req, res, next, TrusteeType.LEGAL_ENTITY);

export const manageTrustsTellUsAboutFormerBOsGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
  await tellUsAboutTrusteesGuard(req, res, next, TrusteeType.HISTORICAL);

export const manageTrustsTellUsAboutIndividualsGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
  await tellUsAboutTrusteesGuard(req, res, next, TrusteeType.INDIVIDUAL);

export const manageTrustsTellUsAboutLegalEntitiesGuard = async (req: Request, res: Response, next: NextFunction): Promise<void> =>
  await tellUsAboutTrusteesGuard(req, res, next, TrusteeType.LEGAL_ENTITY);
