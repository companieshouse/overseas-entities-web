import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { v4 as uuidv4 } from 'uuid';

import { logger } from "./logger";
import { saveAndContinue } from "./save.and.continue";
import { ApplicationDataType } from "../model";
import {
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
} from "./application.data";
import { ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";
import {
  AddressKeys,
  HasSamePrincipalAddressKey,
  ID,
  IsOnRegisterInCountryFormedInKey,
  PublicRegisterNameKey,
  RegistrationNumberKey
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";

export const getManagingOfficerCorporate = (req: Request, res: Response, backLinkUrl: string, templateName: string) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName
  });
};

export const getManagingOfficerCorporateById = (req: Request, res: Response, next: NextFunction, backLinkUrl: string, templateName: string) => {
  try {
    logger.debugRequest(req, `${req.method} BY ID ${req.route.path}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, ManagingOfficerCorporateKey, id, true);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};

    return res.render(templateName, {
      backLinkUrl: backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postManagingOfficerCorporate = async(req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = setOfficerData(req.body, uuidv4());

    const session = req.session as Session;
    setApplicationData(session, data, ManagingOfficerCorporateKey);
    if (registrationFlag) {
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateManagingOfficerCorporate = async(req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    // Remove old Managing Officer
    removeFromApplicationData(req, ManagingOfficerCorporateKey, req.params[ID]);

    // Set officer data
    const data: ApplicationDataType = setOfficerData(req.body, req.params[ID]);

    // Save new Managing Officer
    const session = req.session as Session;
    setApplicationData(session, data, ManagingOfficerCorporateKey);

    if (registrationFlag) {
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeManagingOfficerCorporate = async(req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    removeFromApplicationData(req, ManagingOfficerCorporateKey, req.params[ID]);
    const session = req.session as Session;

    if (registrationFlag) {
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setOfficerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, ManagingOfficerCorporateKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};

  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';
  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }
  data[ID] = id;

  return data;
};
