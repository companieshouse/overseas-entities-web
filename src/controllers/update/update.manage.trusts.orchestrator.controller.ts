import { NextFunction, Request, Response } from 'express';
import { Session } from "@companieshouse/node-session-handler";

import { logger } from '../../utils/logger';
import {
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
} from '../../config';
import { ApplicationData } from '../../model';
import { Trust } from '../../model/trust.model';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview, setupNextTrustForReview } from '../../utils/update/review_trusts';

export const handler = async (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  try {
    const appData = getApplicationData(req.session);
    const trustInReview = getTrustInReview(appData);

    if (!trustInReview) {
      if (setupNextTrustForReview(appData)) {
        await saveAppData(req, appData);
        return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);
      } else {
        return res.redirect(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
      }
    }

    if (shouldGoToReviewFormerBOs(trustInReview)) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);
    }

    if (shouldGoToReviewIndividuals(trustInReview)) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
    }

    if (shouldGoToReviewLegalEntities(trustInReview)) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL);
    }

    return res.redirect(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL);
  } catch (error) {
    next(error);
    return;
  }
};

const shouldGoToReviewFormerBOs = (trustInReview: Trust) => {
  const hasFormerBOs = (trustInReview.HISTORICAL_BO ?? []).length > 0;
  const hasReviewedFormerBOs = trustInReview.review_status?.reviewed_former_bos ?? true;

  return hasFormerBOs && !hasReviewedFormerBOs;
};

const shouldGoToReviewIndividuals = (trustInReview: Trust) => {
  const hasIndividuals = (trustInReview.INDIVIDUALS ?? []).length > 0;
  const hasReviewedIndividuals = trustInReview.review_status?.reviewed_individuals ?? true;

  return hasIndividuals && !hasReviewedIndividuals;
};

const shouldGoToReviewLegalEntities = (trustInReview: Trust) => {
  const hasLegalEntities = (trustInReview.CORPORATES ?? []).length > 0;
  const hasReviewedLegalEntities = trustInReview.review_status?.reviewed_legal_entities ?? true;

  return hasLegalEntities && !hasReviewedLegalEntities;
};

const saveAppData = async(req: Request, appData: ApplicationData) => {
  setExtraData(req.session, appData);
  await saveAndContinue(req, req.session as Session, false);
};
