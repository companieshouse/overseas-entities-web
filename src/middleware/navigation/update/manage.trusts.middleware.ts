import { NextFunction, Request, Response } from "express";

import { logger } from "../../../utils/logger";
import { NavigationErrorMessage } from "../check.condition";
import { ROUTE_PARAM_TRUSTEE_ID, SECURE_UPDATE_FILTER_URL } from '../../../config';
import { getTrustInReview, getTrusteeIndex, hasTrusteesToReview, hasTrustsToReview } from "../../../utils/update/review_trusts";
import { getApplicationData } from "../../../utils/application.data";
import { TrusteeType } from "../../../model/trustee.type.model";

export const reviewTheTrustGuard = (req: Request, res: Response, next: NextFunction) => {
  try {
    const appData = getApplicationData(req.session);

    if (hasTrustsToReview(appData)) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};

const reviewTrusteesGuard = (req: Request, res: Response, next: NextFunction, trusteeType: TrusteeType) => {
  try {
    const appData = getApplicationData(req.session);
    const trustInReview = getTrustInReview(appData);
    const hasIndividualTrustees = hasTrusteesToReview(trustInReview, trusteeType);

    if (hasIndividualTrustees) {
      return next();
    }

    logger.infoRequest(req, NavigationErrorMessage);
    return res.redirect(SECURE_UPDATE_FILTER_URL);
  } catch (err) {
    next(err);
  }
};

const tellUsAboutTrusteesGuard = (req: Request, res: Response, next: NextFunction, trusteeType: TrusteeType) => {
  try {
    const appData = getApplicationData(req.session);
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

export const manageTrustsReviewFormerBOsGuard = (req: Request, res: Response, next: NextFunction) =>
  reviewTrusteesGuard(req, res, next, TrusteeType.HISTORICAL);

export const manageTrustsReviewIndividualsGuard = (req: Request, res: Response, next: NextFunction) =>
  reviewTrusteesGuard(req, res, next, TrusteeType.INDIVIDUAL);

export const manageTrustsReviewLegalEntitiesGuard = (req: Request, res: Response, next: NextFunction) =>
  reviewTrusteesGuard(req, res, next, TrusteeType.LEGAL_ENTITY);

export const manageTrustsTellUsAboutFormerBOsGuard = (req: Request, res: Response, next: NextFunction) =>
  tellUsAboutTrusteesGuard(req, res, next, TrusteeType.HISTORICAL);

export const manageTrustsTellUsAboutIndividualsGuard = (req: Request, res: Response, next: NextFunction) =>
  tellUsAboutTrusteesGuard(req, res, next, TrusteeType.INDIVIDUAL);

export const manageTrustsTellUsAboutLegalEntitiesGuard = (req: Request, res: Response, next: NextFunction) =>
  tellUsAboutTrusteesGuard(req, res, next, TrusteeType.LEGAL_ENTITY);
