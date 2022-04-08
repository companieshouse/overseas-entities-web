import { NextFunction, Request, Response } from "express";

import {
  getApplicationData,
  setApplicationData,
  prepareData,
  mapObjectFieldToAddress,
  mapAddressToObjectField,
} from "../utils/application.data";
import { ApplicationData, ApplicationDataType, entityType } from "../model";
import { logger } from "../utils/logger";
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);
    const entityData = appData[entityType.EntityKey] as any;

    if (entityData){
      entityData[entityType.PrincipalAddressKey] = mapAddressToObjectField(
        entityData[entityType.PrincipalAddressKey],
        entityType.PrincipalAddressKeys
      );
      entityData[entityType.ServiceAddressKey] = mapAddressToObjectField(
        entityData[entityType.ServiceAddressKey],
        entityType.ServiceAddressKeys
      );
    }

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.PRESENTER_URL,
      ...entityData
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

    data[entityType.PrincipalAddressKey] = mapObjectFieldToAddress(req.body, entityType.PrincipalAddressKeys);
    data[entityType.ServiceAddressKey] = mapObjectFieldToAddress(req.body, entityType.ServiceAddressKeys);

    setApplicationData(req.session, data, entityType.EntityKey);

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
