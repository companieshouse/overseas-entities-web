import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
} from '../../config';
import { getApplicationData } from '../../utils/application.data';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    // Resets in_review status to false when landig on page. Used to avoid skipping to BO page if still sees in_review as true
    const appData = getApplicationData(req.session);
    const trustToReview = (appData.update?.review_trusts ?? []).find(trust => trust.review_status);
        
    if (trustToReview?.review_status) {
      trustToReview.review_status.in_review = false;
    }
    
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

    return res.redirect(UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL);
  } catch (error) {
    next(error);
  }
};
