import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import { Session } from "@companieshouse/node-session-handler";
import { saveAndContinue } from "./save.and.continue";
import { ApplicationData, ApplicationDataType } from "../model";
import { getApplicationData, getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "./application.data";
import { addCeasedDateToTemplateOptions } from "../utils/update/ceased_date_util";
import { BeneficialOwnerOtherKey, BeneficialOwnerOtherKeys } from "../model/beneficial.owner.other.model";
import {
  AddressKeys,
  BeneficialOwnerNoc,
  EntityNumberKey,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnRegisterInCountryFormedInKey,
  IsOnSanctionsListKey,
  NonLegalFirmNoc, PublicRegisterNameKey, RegistrationNumberKey,
  TrusteesNoc
} from "../model/data.types.model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import {
  CeasedDateKey,
  CeasedDateKeys,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";
import { v4 as uuidv4 } from 'uuid';
import * as config from "../config";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";

export const getBeneficialOwnerOther = (req: Request, res: Response, templateName: string, backLinkUrl: string) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName,
    ...appData, relevant_period: req.query["relevant-period"] === "true",
  });
};

export const getBeneficialOwnerOtherById = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string) => {
  try {
    logger.debugRequest(req, `GET BY ID ${req.route.path}`);

    const id = req.params[ID];
    const data = getFromApplicationData(req, BeneficialOwnerOtherKey, id, true);

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

    // Redis removal work - Add extra template options if Redis Remove flag is true and on Registration journey
    const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);
    if (isRegistration) {
      addActiveSubmissionBasePathToTemplateData(templateOptions, req);
    }

    const appData = getApplicationData(req.session);

    if (EntityNumberKey in appData && appData[EntityNumberKey]) {
      return res.render(templateName, addCeasedDateToTemplateOptions(templateOptions, appData, data));
    } else {
      return res.render(templateName, templateOptions);
    }

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());

    const session = req.session as Session;
    setApplicationData(session, data, BeneficialOwnerOtherKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    // Remove old Beneficial Owner
    removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, req.params[ID]);

    // Save new Beneficial Owner
    const session = req.session as Session;
    setApplicationData(session, data, BeneficialOwnerOtherKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID]);
    const session = req.session as Session;

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerOtherKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  data[CeasedDateKey] = reqBody["is_still_bo"] === '0' ? mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys) : {};

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }
  data[ID] = id;

  return data;
};
