import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  FEATURE_FLAG_ENABLE_CEASE_TRUSTS,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
} from '../../config';
import { getTrustInReview, hasTrustsToReview, resetTrustInReviewPagesReviewed } from '../../utils/update/review_trusts';
import { ApplicationData } from '../../model';
import { getApplicationData } from '../../utils/application.data';
import { Trust } from '../../model/trust.model';
import { isActiveFeature } from '../../utils/feature.flag';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
      backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // reset the page visited flags for the current trust in review so user can review data
    // if they have gone back to an earlier screen and changed something that might affect the trust
    if (isActiveFeature(FEATURE_FLAG_ENABLE_CEASE_TRUSTS)) {
      resetTrustFlagsIfTrustInReview(req);
    }

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};

const resetTrustFlagsIfTrustInReview = (req: Request) => {
  const appData: ApplicationData = getApplicationData(req.session);
  if (hasTrustsToReview(appData)) {
    const trustInReview = getTrustInReview(appData) as Trust;
    if (trustInReview) {
      resetTrustInReviewPagesReviewed(trustInReview);
    }
  }
};
