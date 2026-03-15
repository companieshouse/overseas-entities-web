import { NextFunction, Request, Response } from 'express';
import { Session } from "@companieshouse/node-session-handler";

import { logger } from '../../utils/logger';
import {
  FEATURE_FLAG_ENABLE_REDIS_REMOVAL,
  ROUTE_PARAM_TRUSTEE_ID,
  ROUTE_PARAM_TRUSTEE_TYPE,
  ROUTE_PARAM_TRUST_ID,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_WITH_PARAMS_URL,
} from '../../config';
import { ApplicationData } from '../../model';
import { Trust } from '../../model/trust.model';
import { fetchApplicationData, getApplicationData, setExtraData } from '../../utils/application.data';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview, putNextTrustInReview, putTrustInChangeScenario } from '../../utils/update/review_trusts';
import { TrusteeType } from '../../model/trustee.type.model';
import { safeRedirect } from '../../utils/http.ext';
import { getRedirectUrl, isRemoveJourney } from '../../utils/url';
import { isActiveFeature } from '../../utils/feature.flag';

export const handler = async (req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  try {
    const isRemove: boolean = await isRemoveJourney(req);
    const appData = await fetchApplicationData(req, !isRemove);
    let trustInReview = getTrustInReview(appData);

    if (!trustInReview) {
      trustInReview = putNextTrustInReview(appData);

      if (!trustInReview) {
        const redirectUrl = getRedirectUrlFor(
          req,
          UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_WITH_PARAMS_URL,
          UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL
        );
        return res.redirect(redirectUrl);
      }

      await saveAppData(req, appData, isRemove);

    }

    if (shouldGoToReviewTheTrust(trustInReview)) {
      const redirectUrl = getRedirectUrlFor(
        req,
        UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_WITH_PARAMS_URL,
        UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL
      );
      return res.redirect(redirectUrl);
    }

    if (shouldGoToReviewFormerBOs(trustInReview)) {
      const redirectUrl = getRedirectUrlFor(
        req,
        UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_WITH_PARAMS_URL,
        UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL
      );
      return res.redirect(redirectUrl);
    }

    if (shouldGoToReviewIndividuals(trustInReview)) {
      const redirectUrl = getRedirectUrlFor(
        req,
        UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_WITH_PARAMS_URL,
        UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL
      );
      return res.redirect(redirectUrl);
    }

    if (shouldGoToReviewLegalEntities(trustInReview)) {
      const redirectUrl = getRedirectUrlFor(
        req,
        UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_WITH_PARAMS_URL,
        UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_URL
      );
      return res.redirect(redirectUrl);
    }

    const redirectUrl = getRedirectUrlFor(
      req,
      UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_WITH_PARAMS_URL,
      UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_URL
    );
    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
    return;
  }
};

const shouldGoToReviewTheTrust = (trustInReview: Trust) => {
  return !trustInReview.review_status?.reviewed_trust_details;
};

export const trustChangeHandler = async(req: Request, res: Response, next: NextFunction) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  try {
    const trustId = req.params[ROUTE_PARAM_TRUST_ID];
    const trusteeId = req.params[ROUTE_PARAM_TRUSTEE_ID];
    const trusteeType = req.params[ROUTE_PARAM_TRUSTEE_TYPE];

    const appData: ApplicationData = await getApplicationData(req.session);

    putTrustInChangeScenario(appData, trustId, trusteeType);

    await saveAppData(req, appData);

    if (trusteeType && trusteeId) {
      safeRedirect(res, getTrusteeNextPage(trusteeType, trusteeId));
    } else {
      res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL);
    }

  } catch (error) {
    next(error);
    return;
  }
};

const getTrusteeNextPage = (trusteeType: string, trusteeId: string) => {
  switch (trusteeType) {
      case TrusteeType.HISTORICAL:
        return `${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL}/${trusteeId}`;
      case TrusteeType.LEGAL_ENTITY:
        return `${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL}/${trusteeId}`;
      case TrusteeType.INDIVIDUAL:
        return `${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL}/${trusteeId}`;
      default:
        return UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL;
  }
};

const shouldGoToReviewFormerBOs = (trustInReview: Trust) => {
  const hasFormerBOs = (trustInReview.HISTORICAL_BO ?? []).length > 0;
  const hasReviewedFormerBOs = trustInReview.review_status?.reviewed_former_bos;

  return hasFormerBOs && !hasReviewedFormerBOs;
};

const shouldGoToReviewIndividuals = (trustInReview: Trust) => {
  const hasIndividuals = (trustInReview.INDIVIDUALS ?? []).length > 0;
  const hasReviewedIndividuals = trustInReview.review_status?.reviewed_individuals;

  return hasIndividuals && !hasReviewedIndividuals;
};

const shouldGoToReviewLegalEntities = (trustInReview: Trust) => {
  const hasLegalEntities = (trustInReview.CORPORATES ?? []).length > 0;
  const hasReviewedLegalEntities = trustInReview.review_status?.reviewed_legal_entities;

  return hasLegalEntities && !hasReviewedLegalEntities;
};

const saveAppData = async (req: Request, appData: ApplicationData, isRemove: boolean = false) => {
  if (!isActiveFeature(FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || isRemove) {
    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session);
  }
};

const getRedirectUrlFor = (
  req: Request,
  urlWithEntityIds: string,
  urlWithoutEntityIds: string
) => getRedirectUrl({ req, urlWithEntityIds, urlWithoutEntityIds });
