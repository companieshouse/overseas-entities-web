import { NextFunction, Request, Response } from "express";

import {
  getApplicationData,
  setApplicationData,
  prepareData,
  mapFieldsToDataObject,
  mapDataObjectToFields
} from "../utils/application.data";
import { EntityKey, EntityKeys } from "../model/entity.model";
import { ApplicationData, ApplicationDataType } from "../model";
import { AddressKeys, HasSamePrincipalAddressKey, IsOnRegisterInCountryFormedInKey } from "../model/data.types.model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);
    const entityData = appData[EntityKey] as any;

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: config.PRESENTER_URL,
      ...entityData,
      [PrincipalAddressKey]: (entityData)
        ? mapDataObjectToFields(entityData[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
        : {},
      [ServiceAddressKey]: (entityData)
        ? mapDataObjectToFields(entityData[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
        : {}
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

    data[PrincipalAddressKey] = mapFieldsToDataObject(req.body, PrincipalAddressKeys, AddressKeys);

    data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
    data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
      ?  mapFieldsToDataObject(req.body, ServiceAddressKeys, AddressKeys)
      :  {};
    data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

    setApplicationData(req.session, data, EntityKey);

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
