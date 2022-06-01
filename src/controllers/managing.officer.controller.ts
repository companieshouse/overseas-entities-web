import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationDataType } from "../model";
import { getFromApplicationData, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";

import { AddressKeys, HasFormerNames, HasSameResidentialAddressKey, InputDateKeys } from "../model/data.types.model";
import { DateOfBirthKey, DateOfBirthKeys } from "../model/date.model";
import { ServiceAddressKey, ServiceAddressKeys, UsualResidentialAddressKey, UsualResidentialAddressKeys } from "../model/address.model";
import { ManagingOfficerKey, ManagingOfficerKeys } from "../model/managing.officer.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.MANAGING_OFFICER_PAGE}`);

    const { id } = req.params;

    return res.render(config.MANAGING_OFFICER_PAGE, {
      id,
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...getFromApplicationData(req.session, ManagingOfficerKey, id)
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.MANAGING_OFFICER_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, ManagingOfficerKeys);

    data[UsualResidentialAddressKey] = mapFieldsToDataObject(req.body, UsualResidentialAddressKeys, AddressKeys);
    data[ServiceAddressKey] = mapFieldsToDataObject(req.body, ServiceAddressKeys, AddressKeys);
    data[DateOfBirthKey] = mapFieldsToDataObject(req.body, DateOfBirthKeys, InputDateKeys);

    data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
    data[HasFormerNames] = (data[HasFormerNames]) ? +data[HasFormerNames] : '';
    data["id"] = uuidv4();

    setApplicationData(req.session, data, ManagingOfficerKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${config.MANAGING_OFFICER_PAGE}`);

    removeFromApplicationData(req.session, ManagingOfficerKey, req.params.id);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
