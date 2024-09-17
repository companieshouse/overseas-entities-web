import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { PARAM_BO_MO_TYPE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkBoOrMoTypeAndId, NavigationErrorMessage } from '../check.condition';
import { ID } from '../../../model/data.types.model';
import { ApplicationData } from 'model';

export const hasGivenValidBoMoDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);

    if (!checkBoOrMoTypeAndId(appData, req.params[PARAM_BO_MO_TYPE], req.params[ID])) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
