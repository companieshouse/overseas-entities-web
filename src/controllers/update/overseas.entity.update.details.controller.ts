import { NextFunction, Request, Response } from "express";


import {
  setApplicationData,
  prepareData,
  mapFieldsToDataObject
} from "../../utils/application.data";
import { EntityKey, EntityKeys } from "../../model/entity.model";
import { ApplicationDataType } from "../../model";
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


export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(config.ENTITY_PAGE, {
      templateName: config.ENTITY_PAGE,
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
    // await saveAndContinue(req, session);
    logger.debugRequest(req, `POST ${config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE}`);
    return res.redirect(config.UPDATE_OVERSEAS_ENTITY_REVIEW_PAGE);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
