import { NextFunction, Request, Response } from 'express';
import { Session } from '@companieshouse/node-session-handler';

import { logger } from '../../utils/logger';
import {
  TRUST_ID,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { ApplicationData } from '../../model';
import { saveAndContinue } from '../../utils/save.and.continue';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
    });
  } catch (error) {
    next(error);
  }
};

// Add
export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(`${UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL}${TRUST_ID}`);
  } catch (error) {
    next(error);
  }
};

// No more to add
export const postSubmit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session);
    const trustId = req.params[TRUST_ID];

    setFormerBOsAsReviewed(appData, trustId);

    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session, false);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const setFormerBOsAsReviewed = (appData: ApplicationData, trustId: string) => {
  const trust = (appData.update?.review_trusts ?? []).find(trust => trust.trust_id === trustId);

  if (!trust?.review) { return; }

  trust.review.reviewed_former_bos = true;
};