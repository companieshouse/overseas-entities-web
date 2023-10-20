import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

import { ApplicationData, ApplicationDataType } from "../model";
import { PrincipalAddressKey, PrincipalAddressKeys, ServiceAddressKey, ServiceAddressKeys } from "../model/address.model";
import {
  AddressKeys,
  EntityNumberKey,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnRegisterInCountryFormedInKey,
  PublicRegisterNameKey,
  RegistrationNumberKey
} from "../model/data.types.model";
import { ResignedOnDateKey, ResignedOnDateKeys, StartDateKey, StartDateKeys } from "../model/date.model";
import { ManagingOfficerCorporate, ManagingOfficerCorporateKey, ManagingOfficerCorporateKeys } from "../model/managing.officer.corporate.model";
import {
  getApplicationData,
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
} from "./application.data";
import { logger } from "./logger";
import { saveAndContinue } from "./save.and.continue";
import { addResignedDateToTemplateOptions } from "./update/ceased_date_util";
import * as config from "../config";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";

const isNewlyAddedMO = (officerData: ManagingOfficerCorporate) => !officerData.ch_reference;

export const getManagingOfficerCorporate = (req: Request, res: Response, backLinkUrl: string, templateName: string) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const appData: ApplicationData = getApplicationData(req.session as Session);

  return res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName,
    entity_number: appData[EntityNumberKey]
  });
};

export const getManagingOfficerCorporateById = (req: Request, res: Response, next: NextFunction, backLinkUrl: string, templateName: string) => {
  try {
    logger.debugRequest(req, `${req.method} BY ID ${req.route.path}`);

    const id = req.params[ID];

    const appData = getApplicationData(req.session);
    const officerData = getFromApplicationData(req, ManagingOfficerCorporateKey, id, true);

    const newlyAddedMO = isNewlyAddedMO(officerData);
    const inUpdateJourney = !!appData[EntityNumberKey];

    const principalAddress = officerData ? mapDataObjectToFields(officerData[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = officerData ? mapDataObjectToFields(officerData[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};

    let templateOptions = {
      backLinkUrl: backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...officerData,
      ...principalAddress,
      ...serviceAddress,
    };

    if (newlyAddedMO) {
      const startDate = officerData ? mapDataObjectToFields(officerData[StartDateKey], StartDateKeys, InputDateKeys) : {};
      templateOptions[StartDateKey] = startDate;
    }

    // Redis removal work - Add extra template options if Redis Remove flag is true and on Registration journey
    const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);
    if (isRegistration) {
      addActiveSubmissionBasePathToTemplateData(templateOptions, req);
    }

    if (inUpdateJourney) {
      templateOptions = addResignedDateToTemplateOptions(templateOptions, appData, officerData);
    }

    return res.render(templateName, templateOptions);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const postManagingOfficerCorporate = async(req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const data: ApplicationDataType = setOfficerData(req.body, uuidv4());

    const session = req.session as Session;
    setApplicationData(session, data, ManagingOfficerCorporateKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateManagingOfficerCorporate = async(req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    // Remove old Managing Officer
    removeFromApplicationData(req, ManagingOfficerCorporateKey, req.params[ID]);

    // Set officer data
    const data: ApplicationDataType = setOfficerData(req.body, req.params[ID]);

    // Save new Managing Officer
    const session = req.session as Session;
    setApplicationData(session, data, ManagingOfficerCorporateKey);

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeManagingOfficerCorporate = async(req: Request, res: Response, next: NextFunction, nextPage: string, registrationFlag: boolean): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    removeFromApplicationData(req, ManagingOfficerCorporateKey, req.params[ID]);
    const session = req.session as Session;

    await saveAndContinue(req, session, registrationFlag);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setOfficerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, ManagingOfficerCorporateKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};

  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';
  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }

  // only set start_date and resigned_on keys for Update journey
  if ('start_date-day' in reqBody){
    data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  }
  if ('is_still_mo' in reqBody){
    data[ResignedOnDateKey] = reqBody["is_still_mo"] === '0' ? mapFieldsToDataObject(reqBody, ResignedOnDateKeys, InputDateKeys) : {};
  }

  data[ID] = id;

  return data;
};
