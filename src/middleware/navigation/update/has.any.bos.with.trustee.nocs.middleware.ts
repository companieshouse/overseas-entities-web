import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';
import { getRedirectUrl } from "../../../utils/url";
import { ApplicationData } from 'model';
import { getApplicationData } from '../../../utils/application.data';
import { checkEntityRequiresTrusts } from '../../../utils/trusts';
import { UPDATE_CHECK_YOUR_ANSWERS_URL, UPDATE_CHECK_YOUR_ANSWERS_WITH_PARAMS_URL } from '../../../config';

export const hasAnyBosWithTrusteeNocs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!checkEntityRequiresTrusts(appData)) {
      logger.infoRequest(req, `No BOs with Trustee NOC. Redirecting to ${UPDATE_CHECK_YOUR_ANSWERS_URL}`);
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: UPDATE_CHECK_YOUR_ANSWERS_WITH_PARAMS_URL,
        urlWithoutEntityIds: UPDATE_CHECK_YOUR_ANSWERS_URL,
      }));
    }
    next();
  } catch (err) {
    next(err);
  }
};
