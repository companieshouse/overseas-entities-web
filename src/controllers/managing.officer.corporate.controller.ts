import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import {
  mapFieldsToDataObject,
  prepareData,
  setApplicationData,
  getFromApplicationData,
  removeFromApplicationData,
} from "../utils/application.data";
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

    const { id } = req.params;

    return res.render(config.MANAGING_OFFICER_CORPORATE_PAGE, {
      id,
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...getFromApplicationData(req.session, ManagingOfficerCorporateKey, id)
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
    data["id"] = uuidv4();

    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${config.MANAGING_OFFICER_PAGE}`);

    removeFromApplicationData(req.session, ManagingOfficerCorporateKey, req.params.id);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
