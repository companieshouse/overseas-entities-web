import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';
import { getRedirectUrl } from "../../../utils/url";
import { ApplicationData } from 'model';
import { getApplicationData } from "../../../utils/application.data";
import { checkUpdateDueDiligenceDetailsEntered, NavigationErrorMessage } from '../check.condition';
import { OVERSEAS_ENTITY_QUERY_URL, OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL } from '../../../config';

export const hasDueDiligenceDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
    if (!checkUpdateDueDiligenceDetailsEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL,
        urlWithoutEntityIds: OVERSEAS_ENTITY_QUERY_URL,
      }));
    }
    next();
  } catch (err) {
    next(err);
  }
};
