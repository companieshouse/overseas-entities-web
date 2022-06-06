import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { ApplicationDataType } from "../model";
import { getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { AddressKeys, BeneficialOwnerNoc, HasSamePrincipalAddressKey, ID, InputDateKeys, IsOnSanctionsListKey, NonLegalFirmNoc } from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import { StartDateKey, StartDateKeys } from "../model/date.model";
import { BeneficialOwnerGovKey, BeneficialOwnerGovKeys } from "../model/beneficial.owner.gov.model";
import { BENEFICIAL_OWNER_GOV_PAGE, BENEFICIAL_OWNER_TYPE_URL } from "../config";
import { v4 as uuidv4 } from "uuid";


export const get = (req: Request, res: Response) => {
  logger.debugRequest(req, `GET ${BENEFICIAL_OWNER_GOV_PAGE}`);

  return res.render(BENEFICIAL_OWNER_GOV_PAGE, {
    backLinkUrl: BENEFICIAL_OWNER_TYPE_URL
  });
};

export const getByID = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `GET BY ID ${BENEFICIAL_OWNER_GOV_PAGE}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req.session, BeneficialOwnerGovKey, id);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    return res.render(BENEFICIAL_OWNER_GOV_PAGE, {
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
    logger.debugRequest(req, `POST ${BENEFICIAL_OWNER_GOV_PAGE}`);

    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

    setApplicationData(req.session, data, BeneficialOwnerGovKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const update = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `UPDATE ${BENEFICIAL_OWNER_GOV_PAGE}`);

    // Remove old Beneficial Owner
    removeFromApplicationData(req.session, BeneficialOwnerGovKey, req.params[ID]);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, req.params[ID]);

    // Save new Beneficial Owner
    setApplicationData(req.session, data, BeneficialOwnerGovKey);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const remove = (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debugRequest(req, `REMOVE ${BENEFICIAL_OWNER_GOV_PAGE}`);

    removeFromApplicationData(req.session, BeneficialOwnerGovKey, req.params[ID]);

    return res.redirect(BENEFICIAL_OWNER_TYPE_URL);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerGovKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);
  data[ServiceAddressKey] = mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys);
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';

  data[ID] = id;

  return data;
};
