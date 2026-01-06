import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "./logger";
import * as config from "../config";
import { saveAndContinue } from "./save.and.continue";
import { addResignedDateToTemplateOptions } from "./update/ceased_date_util";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { isRegistrationJourney } from "./url";
import { isActiveFeature } from "./feature.flag";

import { ApplicationData, ApplicationDataType } from "../model";

import {
  PrincipalAddressKey,
  PrincipalAddressKeys,
  ServiceAddressKey,
  ServiceAddressKeys
} from "../model/address.model";

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

import {
  ResignedOnDateKey,
  ResignedOnDateKeys,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";

import {
  ManagingOfficerCorporate,
  ManagingOfficerCorporateKey,
  ManagingOfficerCorporateKeys
} from "../model/managing.officer.corporate.model";

import {
  fetchApplicationData,
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
} from "./application.data";

const isNewlyAddedMO = (officerData: ManagingOfficerCorporate) => !officerData.ch_reference;

export const getManagingOfficerCorporate = async (
  req: Request,
  res: Response,
  next: NextFunction,
  backLinkUrl: string,
  templateName: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

    return res.render(templateName, {
      backLinkUrl,
      templateName,
      entity_number: appData[EntityNumberKey]
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const getManagingOfficerCorporateById = async (
  req: Request,
  res: Response,
  next: NextFunction,
  backLinkUrl: string,
  templateName: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} BY ID ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const id = req.params[ID];
    const officerData = await getFromApplicationData(req, ManagingOfficerCorporateKey, id, true);
    const newlyAddedMO = isNewlyAddedMO(officerData);
    const inUpdateJourney = !!appData[EntityNumberKey];
    const principalAddress = officerData ? mapDataObjectToFields(officerData[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = officerData ? mapDataObjectToFields(officerData[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};

    let templateOptions = {
      backLinkUrl,
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

export const postManagingOfficerCorporate = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const data: ApplicationDataType = setOfficerData(req.body, uuidv4());
    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await setApplicationData(req, data, ManagingOfficerCorporateKey);
    } else {
      await setApplicationData(session, data, ManagingOfficerCorporateKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateManagingOfficerCorporate = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    await removeFromApplicationData(req, ManagingOfficerCorporateKey, req.params[ID]); // remove old managing officer
    const data: ApplicationDataType = setOfficerData(req.body, req.params[ID]); // set officer data
    const session = req.session as Session; // save new managing officer

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await setApplicationData(req, data, ManagingOfficerCorporateKey);
    } else {
      await setApplicationData(session, data, ManagingOfficerCorporateKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeManagingOfficerCorporate = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    await removeFromApplicationData(req, ManagingOfficerCorporateKey, req.params[ID]);
    const session = req.session as Session;

    if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || !isRegistration) {
      await saveAndContinue(req, session);
    }
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
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey]) ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys) : {};
  data[IsOnRegisterInCountryFormedInKey] = (data[IsOnRegisterInCountryFormedInKey]) ? +data[IsOnRegisterInCountryFormedInKey] : '';

  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }
  if ('start_date-day' in reqBody) { // only set start_date and resigned_on keys for Update journey
    data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  }
  if ('is_still_mo' in reqBody) {
    data[ResignedOnDateKey] = reqBody["is_still_mo"] === '0' ? mapFieldsToDataObject(reqBody, ResignedOnDateKeys, InputDateKeys) : {};
  }
  data[ID] = id;

  logger.info(`Inside setOfficerData data = ${data}`);

  return data;
};
