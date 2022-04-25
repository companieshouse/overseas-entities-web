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
import * as config from "../config";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);
    const entityData = appData[EntityKey] as any;

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.PRESENTER_URL,
      ...entityData,
      [PrincipalAddressKey]: (entityData) ? mapAddressToObjectField(entityData[PrincipalAddressKey], PrincipalAddressKeys) : {},
      [ServiceAddressKey]: (entityData) ? mapAddressToObjectField(entityData[ServiceAddressKey], ServiceAddressKeys) : {}
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ENTITY_PAGE`);

    const data: ApplicationDataType = prepareData(req.body, EntityKeys);
    data[PrincipalAddressKey] = mapObjectFieldToAddress(req.body, PrincipalAddressKeys);

    data[HasSameAddressKey] = +data[HasSameAddressKey];
    data[ServiceAddressKey] = (!data[HasSameAddressKey])
      ?  mapObjectFieldToAddress(req.body, ServiceAddressKeys)
      :  {};

    setApplicationData(req.session, data, EntityKey);

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
