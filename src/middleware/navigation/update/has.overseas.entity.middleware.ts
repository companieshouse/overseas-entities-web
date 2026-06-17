import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger';
import { getRedirectUrl } from "../../../utils/url";
import { ApplicationData } from 'model';
import { getApplicationData } from "../../../utils/application.data";

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
import { getDataFromEntityCookie } from "../../../utils/update/data.cookie";

export const hasOverseasEntityNumber = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appData: ApplicationData = await getApplicationData(req);
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
    const appData: ApplicationData = await getAppData(req);
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

const getAppData = async (req: Request): Promise<ApplicationData> => {
  let appData: ApplicationData = await getApplicationData(req);
  if (!Object.keys(appData).length) {
    appData = await getDataFromEntityCookie(req);
  }
  return appData;
};
