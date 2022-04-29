import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationData, ApplicationDataType, beneficialOwnerOtherType } from "../model";
import { getApplicationData, mapFieldsToDataObject, prepareData, setApplicationData } from "../utils/application.data";
import {  BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";
import {
  AddressKeys, BeneficialOwnerNoc, HasSamePrincipalAddressKey, InputDateKeys, IsOnSanctionsListKey, NonLegalFirmNoc, TrusteesNoc
} from "../model/data.types.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const appData: ApplicationData = getApplicationData(req.session);

    return res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...appData.beneficial_owners_corporate
    });
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {

  try {
    logger.debugRequest(req, `POST ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const data: ApplicationDataType = prepareData(req.body, BeneficialOwnerOtherKeys);

    data[beneficialOwnerOtherType.PrincipalAddressKey] =
        mapFieldsToDataObject(req.body, beneficialOwnerOtherType.PrincipalAddressKeys, AddressKeys);
    data[beneficialOwnerOtherType.ServiceAddressKey] =
        mapFieldsToDataObject(req.body, beneficialOwnerOtherType.ServiceAddressKeys, AddressKeys);

    data[beneficialOwnerOtherType.StartDateKey] =
        mapFieldsToDataObject(req.body, beneficialOwnerOtherType.StartDateKeys, InputDateKeys);

    data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
    data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
    data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

    data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
    data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';

    setApplicationData(req.session, data, BeneficialOwnerOtherKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

