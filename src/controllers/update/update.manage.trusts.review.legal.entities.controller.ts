import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../../utils/logger';
import {
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview } from '../../utils/update/review_trusts';
import { Trust } from '../../model/trust.model';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData = getApplicationData(req.session);
    const trust = getTrustInReview(appData) as Trust;
    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
      entity_name: appData.entity_name,
      legal_entities: trust.CORPORATES,
      trustId: trust.trust_id
    });
  } catch (error) {
    next(error);
  }
};

// Add
export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    if (req.body.addLegalEntity) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);
    }
    const appData = getApplicationData(req.session);
    const trust = getTrustInReview(appData) as Trust;
    setLegalEntitiesAsReviewed(appData, trust.trust_id);

    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session, false);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const setLegalEntitiesAsReviewed = (appData: ApplicationData, trustId: string) => {
  const trust = (appData.update?.review_trusts ?? []).find(trust => trust.trust_id === trustId);

  if (!trust?.review) { return; }

  trust.review.reviewed_legal_entities = true;
};
