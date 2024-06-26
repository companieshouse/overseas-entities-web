import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { UPDATE_CHECK_YOUR_ANSWERS_URL } from '../../../config';
import { getApplicationData } from '../../../utils/application.data';
import { checkEntityRequiresTrusts } from '../../../utils/trusts';

export const hasAnyBosWithTrusteeNocs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!checkEntityRequiresTrusts(await getApplicationData(req.session))) {
      logger.infoRequest(req, `No BOs with Trustee NOC. Redirecting to ${UPDATE_CHECK_YOUR_ANSWERS_URL}`);
      return res.redirect(UPDATE_CHECK_YOUR_ANSWERS_URL);
    }

    next();
  } catch (err) {
    next(err);
  }
};
