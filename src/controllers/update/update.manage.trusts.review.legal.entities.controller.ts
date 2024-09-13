import { NextFunction, Request, Response } from 'express';

import { Session } from '@companieshouse/node-session-handler';

import {
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
  UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL,
} from '../../config';
import { logger } from '../../utils/logger';
import { getApplicationData, setExtraData } from '../../utils/application.data';
import { saveAndContinue } from '../../utils/save.and.continue';
import { getTrustInReview, setTrusteesAsReviewed } from '../../utils/update/review_trusts';
import { ApplicationData } from '../../model';
import { TrusteeType } from '../../model/trustee.type.model';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const appData = await getApplicationData(req.session);
    const trustInReview = getTrustInReview(appData);
    const legalEntities = trustInReview?.CORPORATES;

    if (!legalEntities || legalEntities.length === 0) {
      throw new Error('Failed to render Manage Trusts Review legal entities page. No legal entities in session');
    }

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_LEGAL_ENTITIES_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
      pageData: {
        trustName: trustInReview?.trust_name ?? '',
        legalEntities,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    if (req.body.addLegalEntity) {
      return res.redirect(UPDATE_MANAGE_TRUSTS_TELL_US_ABOUT_THE_LEGAL_ENTITY_URL);
    }

    const appData = await getApplicationData(req.session);

    setTrusteesAsReviewed(appData, TrusteeType.LEGAL_ENTITY);

    await saveAppData(req, appData);

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const saveAppData = async(req: Request, appData: ApplicationData) => {
  setExtraData(req.session, appData);
  await saveAndContinue(req, req.session as Session);
};
