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
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { Trust } from '../../model/trust.model';
import { saveAndContinue } from '../../utils/save.and.continue';

const handler = async (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  try {
    const appData = getApplicationData(req.session);
    let trustInReview = getTrustInReview(appData);

    if (!trustInReview) {
      trustInReview = putTrustInReview(appData);
      if (trustInReview) {
        await saveAppData(req, appData);
        return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL + trustInReview.trust_id);
      } else {
        return res.redirect(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
      }
    }

    if (shouldGoToReviewFormerBOs(trustInReview)) {
      return res.redirect(`${UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL}`);
    }

    if (shouldGoToReviewIndividuals(trustInReview)) {
      return res.redirect(`${UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL}`);
    }

    if (shouldGoToReviewLegalEntities(trustInReview)) {
      return res.redirect(`${UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL}`);
    }

    return res.redirect(`${UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL}/${trustInReview.trust_id}`);
  } catch (error) {
    next(error);
    return;
  }
};

const getTrustInReview = (appData: ApplicationData) => {
  return (appData.update?.review_trusts ?? []).find(trust => trust.review?.in_review);
};

const putTrustInReview = (appData: ApplicationData): Trust | undefined => {
  const trustToReview = (appData.update?.review_trusts ?? [])[0];

  if (!trustToReview) {
    return undefined;
  }

  // create review meta data for trust
  trustToReview.review = {
    in_review: true,
    reviewed_former_bos: false,
    reviewed_individuals: false,
    reviewed_legal_entities: false,
  };

  return trustToReview;
};

const shouldGoToReviewFormerBOs = (trustInReview: Trust) => {
  const hasFormerBOs = (trustInReview.HISTORICAL_BO ?? []).length > 0;
  const hasReviewedFormerBOs = trustInReview.review?.reviewed_former_bos ?? true;

  return hasFormerBOs && !hasReviewedFormerBOs;
};

const shouldGoToReviewIndividuals = (trustInReview: Trust) => {
  const hasIndividuals = (trustInReview.INDIVIDUALS ?? []).length > 0;
  const hasReviewedIndividuals = trustInReview.review?.reviewed_individuals ?? true;

  return hasIndividuals && !hasReviewedIndividuals;
};

const shouldGoToReviewLegalEntities = (trustInReview: Trust) => {
  const hasLegalEntities = (trustInReview.CORPORATES ?? []).length > 0;
  const hasReviewedLegalEntities = trustInReview.review?.reviewed_legal_entities ?? true;

  return hasLegalEntities && !hasReviewedLegalEntities;
};

const saveAppData = async(req: Request, appData: ApplicationData) => {
  setExtraData(req.session, appData);
  await saveAndContinue(req, req.session as Session, false);
};

export const get = handler;
export const post = handler;
