import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { logger } from "../utils/logger";
import { saveAndContinue } from "../utils/save.and.continue";
import { ApplicationDataType } from "../model";
import {
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  setApplicationData,
  removeFromApplicationData
} from "../utils/application.data";

import {
  AddressKeys,
  HasFormerNames,
  HasSameResidentialAddressKey,
  ID,
  InputDateKeys
} from "../model/data.types.model";
import { DateOfBirthKey, DateOfBirthKeys } from "../model/date.model";
import { ServiceAddressKey, ServiceAddressKeys, UsualResidentialAddressKey, UsualResidentialAddressKeys } from "../model/address.model";
import { FormerNamesKey, ManagingOfficerKey, ManagingOfficerKeys } from "../model/managing.officer.model";
import { v4 as uuidv4 } from 'uuid';

export const getManagingOfficer = (req: Request, res: Response, backLinkUrl: string, templateName: string) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  return res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName
  });
};

export const getManagingOfficerById = (req: Request, res: Response, next: NextFunction, backlinkUrl: string, templateName: string) => {
  try {
    logger.debugRequest(req, `${req.method} BY ID ${templateName}`);

    const id = req.params[ID];
    const officerData = getFromApplicationData(req, ManagingOfficerKey, id, true);

    const usualResidentialAddress = (officerData) ? mapDataObjectToFields(officerData[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    const serviceAddress = (officerData) ? mapDataObjectToFields(officerData[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const dobDate = (officerData) ? mapDataObjectToFields(officerData[DateOfBirthKey], DateOfBirthKeys, InputDateKeys) : {};

    return res.render(templateName, {
      backLinkUrl: backlinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...officerData,
      ...usualResidentialAddress,
      ...serviceAddress,
      [DateOfBirthKey]: dobDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postManagingOfficer = async (req: Request, res: Response, next: NextFunction, redirectUrl: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const officerData: ApplicationDataType = setOfficerData(req.body, uuidv4());

    const session = req.session as Session;
    setApplicationData(session, officerData, ManagingOfficerKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateManagingOfficer = async (req: Request, res: Response, next: NextFunction, redirectUrl: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    removeFromApplicationData(req, ManagingOfficerKey, req.params[ID]);

    const officerData: ApplicationDataType = setOfficerData(req.body, req.params[ID]);

    const session = req.session as Session;
    setApplicationData(session, officerData, ManagingOfficerKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeManagingOfficer = async (req: Request, res: Response, next: NextFunction, redirectUrl: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    removeFromApplicationData(req, ManagingOfficerKey, req.params.id);
    const session = req.session as Session;

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(redirectUrl);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setOfficerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, ManagingOfficerKeys);
  data[UsualResidentialAddressKey] = mapFieldsToDataObject(reqBody, UsualResidentialAddressKeys, AddressKeys);
  data[DateOfBirthKey] = mapFieldsToDataObject(reqBody, DateOfBirthKeys, InputDateKeys);

  data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSameResidentialAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[HasFormerNames] = (data[HasFormerNames]) ? +data[HasFormerNames] : '';
  if (!data[HasFormerNames]) {
    data[FormerNamesKey] = "";
  }

  data[ID] = id;

  return data;
};
