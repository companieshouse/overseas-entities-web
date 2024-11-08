import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Session } from "@companieshouse/node-session-handler";
import { logger } from "../utils/logger";
import * as config from "../config";
import { saveAndContinue } from "../utils/save.and.continue";
import { addResignedDateToTemplateOptions } from "./update/ceased_date_util";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { isRegistrationJourney } from "./url";
import { isActiveFeature } from "./feature.flag";

import { ApplicationData, ApplicationDataType } from "../model";

import {
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  setApplicationData,
  removeFromApplicationData,
  fetchApplicationData,
} from "../utils/application.data";

import {
  AddressKeys,
  EntityNumberKey,
  HasFormerNames,
  HasSameResidentialAddressKey,
  ID,
  InputDateKeys
} from "../model/data.types.model";

import {
  DateOfBirthKey,
  DateOfBirthKeys,
  HaveDayOfBirthKey,
  ResignedOnDateKey,
  ResignedOnDateKeys,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  UsualResidentialAddressKey,
  UsualResidentialAddressKeys
} from "../model/address.model";

import {
  FormerNamesKey,
  ManagingOfficerIndividual,
  ManagingOfficerKey,
  ManagingOfficerKeys
} from "../model/managing.officer.model";

const isNewlyAddedMO = (officerData: ManagingOfficerIndividual) => !officerData.ch_reference;

export const getManagingOfficer = async (req: Request, res: Response, backLinkUrl: string, templateName: string) => {

  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const isRegistration = isRegistrationJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

  return res.render(templateName, {
    backLinkUrl,
    templateName,
    entity_number: appData[EntityNumberKey]
  });

};

export const getManagingOfficerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
  backLinkUrl: string,
  templateName: string
) => {

  try {

    logger.debugRequest(req, `${req.method} BY ID ${templateName}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const id = req.params[ID];
    const officerData = await getFromApplicationData(req, ManagingOfficerKey, id, true);
    const newlyAddedMO = isNewlyAddedMO(officerData);
    const inUpdateJourney = !!appData[EntityNumberKey];
    const usualResidentialAddress = officerData ? mapDataObjectToFields(officerData[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    const serviceAddress = officerData ? mapDataObjectToFields(officerData[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const dobDate = officerData ? mapDataObjectToFields(officerData[DateOfBirthKey], DateOfBirthKeys, InputDateKeys) : {};

    let templateOptions = {
      backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...officerData,
      ...usualResidentialAddress,
      ...serviceAddress,
      [DateOfBirthKey]: dobDate,
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

export const postManagingOfficer = async (req: Request, res: Response, next: NextFunction, redirectUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const officerData: ApplicationDataType = setOfficerData(req.body, uuidv4());
    officerData[HaveDayOfBirthKey] = true;
    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await setApplicationData(req, officerData, ManagingOfficerKey);
    } else {
      await setApplicationData(session, officerData, ManagingOfficerKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateManagingOfficer = async (req: Request, res: Response, next: NextFunction, redirectUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    await removeFromApplicationData(req, ManagingOfficerKey, req.params[ID]);
    const officerData: ApplicationDataType = setOfficerData(req.body, req.params[ID]);
    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await setApplicationData(req, officerData, ManagingOfficerKey);
    } else {
      await setApplicationData(session, officerData, ManagingOfficerKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeManagingOfficer = async (req: Request, res: Response, next: NextFunction, redirectUrl: string): Promise<void> => {

  try {

    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const session = req.session as Session;
    await removeFromApplicationData(req, ManagingOfficerKey, req.params.id);

    if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || !isRegistration) {
      await saveAndContinue(req, session);
    }

    return res.redirect(redirectUrl);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setOfficerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, ManagingOfficerKeys);
  data[UsualResidentialAddressKey] = mapFieldsToDataObject(reqBody, UsualResidentialAddressKeys, AddressKeys);
  data[DateOfBirthKey] = mapFieldsToDataObject(reqBody, DateOfBirthKeys, InputDateKeys);
  data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSameResidentialAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[HasFormerNames] = (data[HasFormerNames]) ? +data[HasFormerNames] : '';

  if (!data[HasFormerNames]) {
    data[FormerNamesKey] = "";
  }
  if ('start_date-day' in reqBody) { // only set start_date and resigned_on keys for Update journey
    data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  }
  if ('is_still_mo' in reqBody) {
    data[ResignedOnDateKey] = reqBody["is_still_mo"] === '0' ? mapFieldsToDataObject(reqBody, ResignedOnDateKeys, InputDateKeys) : {};
  }
  data[ID] = id;

  return data;

};
