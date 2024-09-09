import { NextFunction, Request, Response } from 'express';

import { logger } from '../../utils/logger';
import {
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
  UPDATE_MANAGE_TRUSTS_ORCHESTRATOR_URL,
  RELEVANT_PERIOD_QUERY_PARAM,
} from '../../config';
import { getApplicationData } from "../../utils/application.data";
import { ApplicationData } from "../../model";
import { checkRelevantPeriod } from "../../utils/relevant.period";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const appData: ApplicationData = getApplicationData(req.session);
    if (checkRelevantPeriod(appData)) {
      return res.render(UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE, {
        templateName: UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
        backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_URL + RELEVANT_PERIOD_QUERY_PARAM,
      });
    } else {
      return res.render(UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE, {
        templateName: UPDATE_MANAGE_TRUSTS_INTERRUPT_PAGE,
        backLinkUrl: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      });
    }
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
