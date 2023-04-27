import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { UPDATE_BENEFICIAL_OWNER_TYPE_URL } from '../../../config';
import { getApplicationData } from "../../../utils/application.data";
import { checkHasGivenValidBOData, NavigationErrorMessage } from '../check.condition';

export const hasGivenValidBODetails = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!checkHasGivenValidBOData(getApplicationData(req.session), req.params['beneficialOwnerType'], req.params['id'])) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(UPDATE_BENEFICIAL_OWNER_TYPE_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
