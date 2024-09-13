import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { UPDATE_CHECK_YOUR_ANSWERS_URL } from '../../../config';
import { getApplicationData } from '../../../utils/application.data';
import { checkEntityRequiresTrusts } from '../../../utils/trusts';
import { ApplicationData } from 'model';

export const hasAnyBosWithTrusteeNocs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);

    if (!checkEntityRequiresTrusts(appData)) {
      logger.infoRequest(req, `No BOs with Trustee NOC. Redirecting to ${UPDATE_CHECK_YOUR_ANSWERS_URL}`);
      return res.redirect(UPDATE_CHECK_YOUR_ANSWERS_URL);
    }

    next();
  } catch (err) {
    next(err);
  }
};
