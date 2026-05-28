import { NextFunction, Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { getRedirectUrl } from '../../utils/url';
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
} from '../../config';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const backLinkUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
    });
    return res.render(UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE, {
      templateName: UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
      backLinkUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const redirectUrl = getRedirectUrl({
      req,
      urlWithEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
      urlWithoutEntityIds: UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
    });
    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};
