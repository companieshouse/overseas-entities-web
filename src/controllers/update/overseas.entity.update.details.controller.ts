import { NextFunction, Request, Response } from "express";


import {
  setApplicationData,
  prepareData,
  mapFieldsToDataObject,
  getApplicationData,
  mapDataObjectToFields,
} from "../../utils/application.data";
import { EntityKey, EntityKeys } from "../../model/entity.model";
import { ApplicationData, ApplicationDataType } from "../../model";
import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey,
  PublicRegisterJurisdictionKey,
  PublicRegisterNameKey,
  RegistrationNumberKey
} from "../../model/data.types.model";
import { logger } from "../../utils/logger";
import * as config from "../../config";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../../model/address.model";
import { Session } from "@companieshouse/node-session-handler";
import { getEntityBackLink } from "../../utils/navigation";


export const get = (req: Request, res: Response, next: NextFunction) => {
  try {

    const appData: ApplicationData = getApplicationData(req.session);

    const entity = appData[EntityKey];
    const principalAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys)
      : {};
    const serviceAddress = (entity && Object.keys(entity).length)
      ? mapDataObjectToFields(entity[ServiceAddressKey], ServiceAddressKeys, AddressKeys)
      : {};

    return res.render(config.ENTITY_PAGE, {
      backLinkUrl: getEntityBackLink(appData),
      templateName: config.ENTITY_PAGE,
      ...entity,
      ...principalAddress,
      ...serviceAddress
    });
  }  catch (error) {
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
    if (!data[IsOnRegisterInCountryFormedInKey]) {
      data[PublicRegisterNameKey] = '';
      data[PublicRegisterJurisdictionKey] = '';
      data[RegistrationNumberKey] = '';
    }

    const session = req.session as Session;
    setApplicationData(session, data, EntityKey);

    logger.debugRequest(req, `POST ${config.OVERSEAS_ENTITY_REVIEW_PAGE}`);
    return res.redirect(config.OVERSEAS_ENTITY_REVIEW_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
