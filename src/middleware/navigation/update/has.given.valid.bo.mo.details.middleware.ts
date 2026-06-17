import { Request, Response, NextFunction } from 'express';
import { ID } from '../../../model/data.types.model';
import { logger } from '../../../utils/logger';
import { getRedirectUrl } from "../../../utils/url";
import { ApplicationData } from 'model';
import { getApplicationData } from "../../../utils/application.data";
import { checkBoOrMoTypeAndId, NavigationErrorMessage } from '../check.condition';

import {
  PARAM_BO_MO_TYPE,
  UPDATE_BENEFICIAL_OWNER_TYPE_URL,
  UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
} from '../../../config';

export const hasGivenValidBoMoDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!checkBoOrMoTypeAndId(appData, req.params[PARAM_BO_MO_TYPE], req.params[ID])) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_BENEFICIAL_OWNER_TYPE_URL,
      }));
    }
    next();
  } catch (err) {
    next(err);
  }
};
