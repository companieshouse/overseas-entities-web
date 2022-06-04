import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

import {
  mapFieldsToDataObject,
  prepareData,
  setApplicationData,
  getFromApplicationData,
  removeFromApplicationData,
  mapDataObjectToFields,
} from "../utils/application.data";
import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnRegisterInCountryFormedInKey
} from "../model/data.types.model";
import {
  PrincipalAddressKey,
  PrincipalAddressKeys,
  ServiceAddressKey,
  ServiceAddressKeys,
} from "../model/address.model";
import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import { StartDateKey, StartDateKeys } from "../model/date.model";
import { MANAGING_OFFICER_CORPORATE_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${MANAGING_OFFICER_CORPORATE_PAGE}`);

  return res.render(MANAGING_OFFICER_CORPORATE_PAGE, {
    backLinkUrl: BENEFICIAL_OWNER_TYPE_URL
  });
};

export const getByID = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${MANAGING_OFFICER_CORPORATE_PAGE}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req.session, ManagingOfficerCorporateKey, id);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    return res.render(MANAGING_OFFICER_CORPORATE_PAGE, {
      backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress,
      [StartDateKey]: startDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${MANAGING_OFFICER_CORPORATE_PAGE}`);

    const data: ApplicationDataType = setOfficerData(req.body, uuidv4());

    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `UPDATE ${MANAGING_OFFICER_CORPORATE_PAGE}`);

    // Remove old Managing Officer
    removeFromApplicationData(req.session, ManagingOfficerCorporateKey, req.params[ID]);

    // Set officer data
    const data: ApplicationDataType = setOfficerData(req.body, req.params[ID]);

    // Save new Managing Officer
    setApplicationData(req.session, data, ManagingOfficerCorporateKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${MANAGING_OFFICER_CORPORATE_PAGE}`);

    removeFromApplicationData(req.session, ManagingOfficerCorporateKey, req.params[ID]);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setOfficerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, ManagingOfficerCorporateKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);
  data[ServiceAddressKey] = mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys);
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  data[ID] = id;

  return data;
};
