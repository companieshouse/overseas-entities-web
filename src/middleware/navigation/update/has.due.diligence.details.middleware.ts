import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { OVERSEAS_ENTITY_QUERY_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkUpdateDueDiligenceDetailsEntered, NavigationErrorMessage } from '../check.condition';

export const hasDueDiligenceDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData = await getApplicationData(req.session);
    if (!checkUpdateDueDiligenceDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(OVERSEAS_ENTITY_QUERY_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
