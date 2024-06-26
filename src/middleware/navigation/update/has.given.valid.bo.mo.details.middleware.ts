import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { PARAM_BO_MO_TYPE, UPDATE_BENEFICIAL_OWNER_TYPE_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkBoOrMoTypeAndId, NavigationErrorMessage } from '../check.condition';
import { ID } from '../../../model/data.types.model';

export const hasGivenValidBoMoDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!checkBoOrMoTypeAndId(await getApplicationData(req.session), req.params[PARAM_BO_MO_TYPE], req.params[ID])) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
