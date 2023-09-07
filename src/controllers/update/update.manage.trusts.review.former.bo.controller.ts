import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_PAGE,
  UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_URL,
} from '../../config';

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

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_INDIVIDUALS_URL);
  } catch (error) {
    next(error);
  }
};