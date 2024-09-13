import { Request, Response, NextFunction } from 'express';

import { logger } from '../../../utils/logger';
import { getApplicationData } from "../../../utils/application.data";
import { checkUpdatePresenterEntered, NavigationErrorMessage } from '.././check.condition';
import { SECURE_UPDATE_FILTER_URL } from '../../../config';
import { ApplicationData } from 'model';

export const hasUpdatePresenter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);

    if (!checkUpdatePresenterEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(SECURE_UPDATE_FILTER_URL);
    }
    next();
  } catch (err) {
    next(err);
  }
};
