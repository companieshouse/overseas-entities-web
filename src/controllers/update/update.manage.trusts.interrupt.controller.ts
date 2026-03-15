import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
  UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
} from '../../config';
import { getRedirectUrl } from '../../utils/url';

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const backLinkUrl = getRedirectUrlFor(
      req,
      UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
      UPDATE_BENEFICIAL_OWNER_TYPE_URL
    );
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

    const redirectUrl = getRedirectUrlFor(
      req,
      UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_WITH_PARAMS_URL,
      UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL
    );

    return res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

const getRedirectUrlFor = (
  req: Request,
  urlWithEntityIds: string,
  urlWithoutEntityIds: string
) => getRedirectUrl({ req, urlWithEntityIds, urlWithoutEntityIds });
