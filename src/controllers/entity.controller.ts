import { NextFunction, Request, Response } from "express";

import { getApplicationData, setApplicationData, prepareData } from "../utils/application.data";
import { ApplicationData, ApplicationDataType, entityType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.PRESENTER_URL,
      ...appData.entity
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ENTITY_PAGE`);

    const data: ApplicationDataType = prepareData(req.body, entityType.EntityKeys);
    data[entityType.PrincipalAddressKey] = prepareData(req.body, entityType.PrincipalAddressKeys);
    data[entityType.ServiceAddressKey] = prepareData(req.body, entityType.ServiceAddressKeys);

    setApplicationData(req.session, data, entityType.EntityKey);

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
