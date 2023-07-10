import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { UPDATE_CHECK_YOUR_ANSWERS_URL } from '../../../config';
import { getApplicationData } from '../../../utils/application.data';
import { checkEntityRequiresTrusts } from '../../../utils/trusts';

export const hasAnyBosWithTrusteeNocs = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkEntityRequiresTrusts(getApplicationData(req.session))) {
      logger.infoRequest(req, `No BOs with Trustee NOC. Redirecting to ${UPDATE_CHECK_YOUR_ANSWERS_URL}`);
      return res.redirect(UPDATE_CHECK_YOUR_ANSWERS_URL);
    }

    next();
  } catch (err) {
    next(err);
  }
};
