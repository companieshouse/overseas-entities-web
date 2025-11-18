import { NextFunction, Request, Response } from 'express';

import { Session } from '@companieshouse/node-session-handler';

import {
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL,
} from '../../config';
import { logger } from '../../utils/logger';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview, setTrusteesAsReviewed } from '../../utils/update/review_trusts';
import { TrusteeType } from '../../model/trustee.type.model';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = await getApplicationData(req.session);
    const trustInReview = getTrustInReview(appData);
    let individuals = trustInReview?.INDIVIDUALS;

    if (!individuals) {
      throw new Error('Failed to render Manage Trusts Review individuals page. No individuals in session');
    }
    // filter individuals to only include those with both firstname and surname
    individuals = individuals.filter(boindividual => boindividual?.forename?.trim() && boindividual?.surname?.trim());

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
      pageData: {
        trustName: trustInReview?.trust_name ?? '',
        individuals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.addIndividual) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_INDIVIDUAL_URL);
    }

    const appData = await getApplicationData(req.session);

    setTrusteesAsReviewed(appData, TrusteeType.INDIVIDUAL);
    setExtraData(req.session, appData);
    await saveAndContinue(req, req.session as Session);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};
