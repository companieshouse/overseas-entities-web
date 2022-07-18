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
import { AddressKeys, HasSamePrincipalAddressKey, IsOnRegisterInCountryFormedInKey, PublicRegisterNameKey, RegistrationNumberKey } from "../model/data.types.model";
import { logger } from "../utils/logger";
import * as config from "../config";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import { getEntityBackLink } from "../utils/navigation";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ENTITY_PAGE`);

    const appData: ApplicationData = getApplicationData(req.session);

    const entity = appData[EntityKey];
    const principalAddress = (entity) ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (entity) ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: getEntityBackLink(appData),
      templateName: config.ENTITY_PAGE,
      ...entity,
      ...principalAddress,
      ...serviceAddress
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

    // Wipe 'register in country formed in' data if IsOnRegisterInCountryFormedInKey is no or not selected
    data[PublicRegisterNameKey] = (data[IsOnRegisterInCountryFormedInKey]) ? data[PublicRegisterNameKey] : '';
    data[RegistrationNumberKey] = (data[IsOnRegisterInCountryFormedInKey]) ? data[RegistrationNumberKey] : '';

    setApplicationData(req.session, data, EntityKey);

    return res.redirect(config.BENEFICIAL_OWNER_STATEMENTS_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
