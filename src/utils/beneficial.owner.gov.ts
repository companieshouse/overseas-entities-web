import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../utils/logger";
import { saveAndContinue } from "../utils/save.and.continue";
import { ApplicationData, ApplicationDataType } from "../model";
import { getApplicationData, getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import {
  AddressKeys,
  BeneficialOwnerNoc,
  EntityNumberKey,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnSanctionsListKey,
  NonLegalFirmNoc
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import {
  CeasedDateKey,
  CeasedDateKeys,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";
import { BeneficialOwnerGovKey, BeneficialOwnerGovKeys } from "../model/beneficial.owner.gov.model";
import { v4 as uuidv4 } from "uuid";

export const getBeneficialOwnerGov = (req: Request, res: Response, templateName: string, backLinkUrl: string) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const appData: ApplicationData = getApplicationData(req.session);

  res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName,
    ...appData
  });
};

export const getBeneficialOwnerGovById = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string) => {
  try {
    logger.debugRequest(req, `GET BY ID ${req.route.path}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, BeneficialOwnerGovKey, id, true);
    const appData = getApplicationData(req.session);

    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    const templateOptions = {
      backLinkUrl: backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress,
      [StartDateKey]: startDate
    };

    // extra data needed for update journey
    if (EntityNumberKey in appData && appData[EntityNumberKey] !== null) {
      templateOptions["is_still_bo"] = (Object.keys(data["ceased_date"]).length === 0) ? 1 : 0;
      templateOptions[EntityNumberKey] = appData[EntityNumberKey];
      templateOptions["ceased_date"] = (data) ? mapDataObjectToFields(data[CeasedDateKey], CeasedDateKeys, InputDateKeys) : {};
    }

    return res.render(templateName, templateOptions);
  } catch (error) {

    logger.errorRequest(req, error);
    next(error);
  }
};

export const postBeneficialOwnerGov = async (req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

    const session = req.session as Session;
    setApplicationData(session, data, BeneficialOwnerGovKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerGov = async (req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);
    const id = req.params[ID];

    // Remove old Beneficial Owner
    removeFromApplicationData(req, BeneficialOwnerGovKey, id);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, id);

    // Save new Beneficial Owner
    const session = req.session as Session;
    setApplicationData(session, data, BeneficialOwnerGovKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerGov = async (req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    removeFromApplicationData(req, BeneficialOwnerGovKey, req.params[ID]);
    const session = req.session as Session;

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerGovKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);
  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);

  // not present in register journey
  if ("is_still_bo" in reqBody && reqBody["is_still_bo"] === '0') {
    data[CeasedDateKey] = mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys);
  } else {
    data[CeasedDateKey] = undefined;
  }

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';

  data[ID] = id;

  return data;
};
