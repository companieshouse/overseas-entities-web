import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL,
} from '../../config';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview, setTrusteesAsReviewed } from '../../utils/update/review_trusts';
import { Trust } from '../../model/trust.model';
import { Session } from '@companieshouse/node-session-handler';
import { TrusteeType } from '../../model/trustee.type.model';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = getApplicationData(req.session as Session);
    const trust = getTrustInReview(appData) as Trust;

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
      trust
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.addFormerBo) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_FORMER_BO_URL);
    }

    const appData = getApplicationData(req.session);
    setTrusteesAsReviewed(appData, TrusteeType.HISTORICAL);

    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};
