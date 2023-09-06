import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  UPDATE_MANAGE_TRUSTS_INTERRUPT_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL,
  UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE,
} from '../../config';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.render(UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_REVIEW_THE_TRUST_PAGE,
      backLinkUrl: UPDATE_MANAGE_TRUSTS_INTERRUPT_URL,
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    return res.redirect(UPDATE_MANAGE_TRUSTS_REVIEW_FORMER_BO_URL);
  } catch (error) {
    next(error);
  }
};
