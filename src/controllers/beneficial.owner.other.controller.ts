import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import { getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";
import {
  AddressKeys, BeneficialOwnerNoc, HasSamePrincipalAddressKey, ID, InputDateKeys, IsOnRegisterInCountryFormedInKey, IsOnSanctionsListKey, NonLegalFirmNoc, TrusteesNoc
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import { StartDateKey, StartDateKeys } from "../model/date.model";
import { v4 as uuidv4 } from 'uuid';
import { BENEFICIAL_OWNER_OTHER_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";

export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${BENEFICIAL_OWNER_OTHER_PAGE}`);

  return res.render(BENEFICIAL_OWNER_OTHER_PAGE, {
    backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
    templateName: BENEFICIAL_OWNER_OTHER_PAGE
  });
};

export const getById = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET BY ID ${BENEFICIAL_OWNER_OTHER_PAGE}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, BeneficialOwnerOtherKey, id);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    return res.render(BENEFICIAL_OWNER_OTHER_PAGE, {
      backLinkUrl: BENEFICIAL_OWNER_TYPE_URL,
      templateName: BENEFICIAL_OWNER_OTHER_PAGE,
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
    logger.debugRequest(req, `POST ${BENEFICIAL_OWNER_OTHER_PAGE}`);

    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

    setApplicationData(req.session, data, BeneficialOwnerOtherKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `UPDATE ${BENEFICIAL_OWNER_OTHER_PAGE}`);

    // Remove old Beneficial Owner
    removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, req.params[ID]);

    // Save new Beneficial Owner
    setApplicationData(req.session, data, BeneficialOwnerOtherKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `REMOVE ${BENEFICIAL_OWNER_OTHER_PAGE}`);

    removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerOtherKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);
  data[ServiceAddressKey] = mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys);
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  data[ID] = id;

  return data;
};
