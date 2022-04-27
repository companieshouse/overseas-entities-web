import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import * as config from "../config";
import { ApplicationData, ApplicationDataType, beneficialOwnerGovType } from "../model";
import { getApplicationData, mapFieldsToDataObject, prepareData, setApplicationData } from "../utils/application.data";
import { AddressKeys, InputDateKeys } from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_GOV_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_GOV_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...appData.beneficialOwnerGov
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_GOV_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, beneficialOwnerGovType.BeneficialOwnerGovKeys);

    data[beneficialOwnerGovType.PrincipalAddressKey] =
        mapFieldsToDataObject(req.body, beneficialOwnerGovType.PrincipalAddressKeys, AddressKeys);
    data[beneficialOwnerGovType.ServiceAddressKey] =
        mapFieldsToDataObject(req.body, beneficialOwnerGovType.ServiceAddressKeys, AddressKeys);

    data[beneficialOwnerGovType.CorporationStartDateKey] =
        mapFieldsToDataObject(req.body, beneficialOwnerGovType.CorporationStartDateKeys, InputDateKeys);

    setApplicationData(req.session, data, beneficialOwnerGovType.BeneficialOwnerGovKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};
