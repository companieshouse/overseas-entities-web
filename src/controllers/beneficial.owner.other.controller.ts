import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

import * as config from "../config";
import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import { getFromApplicationData, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";
import {
  AddressKeys, BeneficialOwnerNoc, HasSamePrincipalAddressKey, InputDateKeys, IsOnRegisterInCountryFormedInKey, IsOnSanctionsListKey, NonLegalFirmNoc, TrusteesNoc
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import { StartDateKey, StartDateKeys } from "../model/date.model";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET ${config.BENEFICIAL_OWNER_OTHER_PAGE}`);

    const { id } = req.params;

    return res.render(config.BENEFICIAL_OWNER_OTHER_PAGE, {
      id,
      backLinkUrl: config.BENEFICIAL_OWNER_TYPE_URL,
      ...getFromApplicationData(req.session, BeneficialOwnerOtherKey, id)
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

    data[PrincipalAddressKey] = mapFieldsToDataObject(req.body, PrincipalAddressKeys, AddressKeys);
    data[ServiceAddressKey] = mapFieldsToDataObject(req.body, ServiceAddressKeys, AddressKeys);

    data[StartDateKey] = mapFieldsToDataObject(req.body, StartDateKeys, InputDateKeys);

    // It needs concatenations because if in the check boxes we select only one option
    // nunjucks returns just a string and with concat we will return an array.
    data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
    data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
    data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

    data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
    data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
    data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';
    data["id"] = uuidv4();

    setApplicationData(req.session, data, BeneficialOwnerOtherKey);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`REMOVE ${config.MANAGING_OFFICER_PAGE}`);

    removeFromApplicationData(req.session, BeneficialOwnerOtherKey, req.params.id);

    return res.redirect(config.BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

