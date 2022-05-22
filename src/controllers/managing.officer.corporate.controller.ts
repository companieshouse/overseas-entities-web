import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType } from "../model";
import { getApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, setApplicationData } from "../utils/application.data";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";
import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  InputDateKeys,
  IsOnRegisterInCountryFormedInKey
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import { StartDateKey, StartDateKeys } from "../model/date.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    const moCorporate = appData[ManagingOfficerCorporateKey];
    const principalAddress = (moCorporate) ? mapDataObjectToFields(moCorporate[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (moCorporate) ? mapDataObjectToFields(moCorporate[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};

    return res.render(config.MANAGING_OFFICER_CORPORATE_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...moCorporate,
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
    logger.debugRequest(req, `POST ${config.MANAGING_OFFICER_CORPORATE_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, ManagingOfficerCorporateKeys);

    data[PrincipalAddressKey] = mapFieldsToDataObject(req.body, PrincipalAddressKeys, AddressKeys);
    data[ServiceAddressKey] = mapFieldsToDataObject(req.body, ServiceAddressKeys, AddressKeys);

    data[StartDateKey] = mapFieldsToDataObject(req.body, StartDateKeys, InputDateKeys);

    data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';

    data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
