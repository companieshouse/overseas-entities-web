import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, managingOfficerType } from "../model";
import { getApplicationData, mapFieldsToDataObject, prepareData, setApplicationData } from "../utils/application.data";
import { AddressKeys } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.MANAGING_OFFICER_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.MANAGING_OFFICER_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...appData.managingOfficer
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.MANAGING_OFFICER_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, managingOfficerType.ManagingOfficerKeys);

    data[managingOfficerType.UsualResidentialAddressKey] =
        mapFieldsToDataObject(req.body, managingOfficerType.UsualResidentialAddressKeys, AddressKeys);

    data[managingOfficerType.DateOfBirthKey] =
        mapFieldsToDataObject(req.body, managingOfficerType.DateOfBirthKeys, AddressKeys);

    setApplicationData(req.session, data, managingOfficerType.ManagingOfficerKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

