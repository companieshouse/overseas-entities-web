import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import { getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";

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
import { BENEFICIAL_OWNER_TYPE_URL, MANAGING_OFFICER_PAGE } from "../config";


export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${MANAGING_OFFICER_PAGE}`);

  return res.render(MANAGING_OFFICER_PAGE, {
    backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
    templateName: MANAGING_OFFICER_PAGE
  });
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET BY ID ${MANAGING_OFFICER_PAGE}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, ManagingOfficerKey, id);

    const usualResidentialAddress = (data) ? mapDataObjectToFields(data[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const dobDate = (data) ? mapDataObjectToFields(data[DateOfBirthKey], DateOfBirthKeys, InputDateKeys) : {};

    return res.render(MANAGING_OFFICER_PAGE, {
      backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
      templateName: MANAGING_OFFICER_PAGE,
      id,
      ...data,
      ...usualResidentialAddress,
      ...serviceAddress,
      [DateOfBirthKey]: dobDate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${MANAGING_OFFICER_PAGE}`);

    const data: ApplicationDataType = setOfficerData(req.body, uuidv4());

    setApplicationData(req.session, data, ManagingOfficerKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `UPDATE ${MANAGING_OFFICER_PAGE}`);

    // Remove old Managing Officer
    removeFromApplicationData(req, ManagingOfficerKey, req.params[ID]);

    // Set officer data
    const data: ApplicationDataType = setOfficerData(req.body, req.params[ID]);

    // Save new Managing Officer
    setApplicationData(req.session, data, ManagingOfficerKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `REMOVE ${MANAGING_OFFICER_PAGE}`);

    removeFromApplicationData(req, ManagingOfficerKey, req.params.id);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
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
    ?  mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    :  {};
  data[HasFormerNames] = (data[HasFormerNames]) ? +data[HasFormerNames] : '';
  if (!data[HasFormerNames]) {
    data[FormerNamesKey] = "";
  }

  data[ID] = id;

  return data;
};
