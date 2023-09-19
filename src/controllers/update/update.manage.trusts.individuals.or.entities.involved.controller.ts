import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../../utils/logger';
import {
  TRUST_ID,
  UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { saveAndContinue } from '../../utils/save.and.continue';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_INDIVIDUALS_OR_ENTITIES_INVOLVED_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // Redirect to adding one of the individual entities
    // depending on the option selected
    return res.redirect(UPDATE_TRUSTS_ASSOCIATED_WITH_THE_OVERSEAS_ENTITY_URL);
  } catch (error) {
    next(error);
  }
};

// No more to add.
export const postSubmit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const trustId = req.params[TRUST_ID];

    // Move trust into main trusts list and remove review meta
    moveTrustOutOfReview(appData, trustId);

    // Save back to appData
    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session, false);

    // Redirect to orchestrator to pick the next trust to review
    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const moveTrustOutOfReview = (appData: ApplicationData, trustId: string) => {
  const trustIndex = (appData.update?.review_trusts ?? []).findIndex(trust => trust.trust_id === trustId);
  const trust = appData.update?.review_trusts?.splice(trustIndex, 1)[0];

  if (!trust) { return; }

  delete trust.review;

  appData.trusts?.push(trust);
};
