import { NextFunction, Request, Response } from "express";

import {
  getApplicationData,
  setApplicationData,
  prepareData,
  mapObjectFieldToAddress,
  mapAddressToObjectField,
} from "../utils/application.data";
import {
  EntityKey,
  EntityKeys,
  HasSameAddressKey,
  PrincipalAddressKey,
  PrincipalAddressKeys,
  ServiceAddressKey,
  ServiceAddressKeys,
} from "../model/entity.model";
import { ApplicationData, ApplicationDataType } from "../model";
import { logger } from "../utils/logger";
import { NAVIGATION } from "../utils/navigation";
import { ENTITY_URL } from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);
    const entityData = appData[EntityKey] as any;

    return res.render(NAVIGATION[ENTITY_URL].currentPage, {
      ...entityData,
      backLinkUrl: NAVIGATION[ENTITY_URL].previusPage,
      [PrincipalAddressKey]: (entityData) ? mapAddressToObjectField(entityData[PrincipalAddressKey], PrincipalAddressKeys) : {},
      [ServiceAddressKey]: (entityData) ? mapAddressToObjectField(entityData[ServiceAddressKey], ServiceAddressKeys) : {}
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`POST ENTITY_PAGE`);

    const data: ApplicationDataType = prepareData(req.body, EntityKeys);
    data[PrincipalAddressKey] = mapObjectFieldToAddress(req.body, PrincipalAddressKeys);

    data[HasSameAddressKey] = +data[HasSameAddressKey];
    data[ServiceAddressKey] = (!data[HasSameAddressKey])
      ?  mapObjectFieldToAddress(req.body, ServiceAddressKeys)
      :  {};

    setApplicationData(req.session, data, EntityKey);

    return res.redirect(NAVIGATION[ENTITY_URL].nextPage);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
