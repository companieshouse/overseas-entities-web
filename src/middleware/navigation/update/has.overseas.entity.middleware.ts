import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';
import { getRedirectUrl } from "../../../utils/url";
import { getApplicationData } from "../../../utils/application.data";
import { ApplicationData } from 'model';

import {
  SECURE_UPDATE_FILTER_URL,
  OVERSEAS_ENTITY_QUERY_URL,
  SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
  OVERSEAS_ENTITY_QUERY_WITH_PARAMS_URL,
} from '../../../config';

import {
  NavigationErrorMessage,
  checkHasOverseasEntity,
  checkHasDateOfCreation,
  checkOverseasEntityNumberEntered
} from '../check.condition';

export const hasOverseasEntityNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);
    if (!checkOverseasEntityNumberEntered(appData)) {
      logger.infoRequest(req, NavigationErrorMessage);
      return res.redirect(getRedirectUrl({
        req,
        urlWithEntityIds: SECURE_UPDATE_FILTER_WITH_PARAMS_URL,
        urlWithoutEntityIds: SECURE_UPDATE_FILTER_URL,
      }));
    }
    next();
  } catch (err) {
    next(err);
  }
};

export const hasOverseasEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req.session);
    if (!checkOverseasEntityNumberEntered(appData) && !checkHasOverseasEntity(appData) || !checkHasDateOfCreation(appData)) {
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
