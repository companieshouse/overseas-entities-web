import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "../utils/logger";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { isActiveFeature } from "./feature.flag";
import { addCeasedDateToTemplateOptions } from "../utils/update/ceased_date_util";
import { saveAndContinue } from "../utils/save.and.continue";
import { isRegistrationJourney } from "./url";

import { ApplicationData, ApplicationDataType } from "../model";
import { BeneficialOwnerGovKey, BeneficialOwnerGovKeys } from "../model/beneficial.owner.gov.model";

import {
  fetchApplicationData,
  getFromApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  prepareData,
  removeFromApplicationData,
  setApplicationData,
  setBoNocDataAsArrays
} from "../utils/application.data";

import {
  AddressKeys,
  EntityNumberKey,
  HasSamePrincipalAddressKey,
  ID,
  InputDateKeys,
  IsOnSanctionsListKey
} from "../model/data.types.model";

import { PrincipalAddressKey,
  PrincipalAddressKeys,
  ServiceAddressKey,
  ServiceAddressKeys,
} from "../model/address.model";

import {
  CeasedDateKey,
  CeasedDateKeys,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";

export const getBeneficialOwnerGov = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);

    res.render(templateName, {
      backLinkUrl,
      templateName,
      ...appData,
      relevant_period: req.query["relevant-period"] === "true",
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    });

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const getBeneficialOwnerGovById = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `GET BY ID ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, isRegistration);
    const id = req.params[ID];
    const data = await getFromApplicationData(req, BeneficialOwnerGovKey, id, true);
    const principalAddress = (data) ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    const templateOptions = {
      backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress,
      [StartDateKey]: startDate,
      entity_name: appData.entity_name,
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    };

    if (isRegistration) {
      addActiveSubmissionBasePathToTemplateData(templateOptions, req);
    }

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

export const postBeneficialOwnerGov = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());
    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await setApplicationData(req, data, BeneficialOwnerGovKey);
    } else {
      await setApplicationData(session, data, BeneficialOwnerGovKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerGov = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const isRegistration = isRegistrationJourney(req);
    const id = req.params[ID];
    await removeFromApplicationData(req, BeneficialOwnerGovKey, id); // remove old beneficial owner
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, id); // set beneficial owner data
    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && isRegistration) {
      await setApplicationData(req, data, BeneficialOwnerGovKey);
    } else {
      await setApplicationData(session, data, BeneficialOwnerGovKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerGov = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);
    const isRegistration = isRegistrationJourney(req);
    await removeFromApplicationData(req, BeneficialOwnerGovKey, req.params[ID]);

    if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || !isRegistration) {
      await saveAndContinue(req, req.session as Session);
    }
    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerGovKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);
  data[HasSamePrincipalAddressKey] = (data[HasSamePrincipalAddressKey]) ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSamePrincipalAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  data[CeasedDateKey] = reqBody["is_still_bo"] === '0' ? mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys) : {};

  setBoNocDataAsArrays(data);

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';

  data[ID] = id;

  return data;
};
