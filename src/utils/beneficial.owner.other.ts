import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { Session } from "@companieshouse/node-session-handler";
import * as config from "../config";
import { logger } from "./logger";
import { isActiveFeature } from "./feature.flag";
import { saveAndContinue } from "./save.and.continue";
import { isRemoveJourney } from "./url";
import { addCeasedDateToTemplateOptions } from "../utils/update/ceased_date_util";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { ApplicationData, ApplicationDataType } from "../model";

import {
  StartDateKey,
  CeasedDateKey,
  StartDateKeys,
  CeasedDateKeys,
} from "../model/date.model";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  PrincipalAddressKey,
  PrincipalAddressKeys,
} from "../model/address.model";

import {
  BeneficialOwnerOther,
  BeneficialOwnerOtherKey,
  BeneficialOwnerOtherKeys,
} from "../model/beneficial.owner.other.model";

import {
  ID,
  AddressKeys,
  InputDateKeys,
  EntityNumberKey,
  IsOnSanctionsListKey,
  PublicRegisterNameKey,
  RegistrationNumberKey,
  HasSamePrincipalAddressKey,
  IsOnRegisterInCountryFormedInKey,
} from "../model/data.types.model";

import {
  prepareData,
  setApplicationData,
  setBoNocDataAsArrays,
  fetchApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  getFromApplicationData,
  removeFromApplicationData,
} from "./application.data";

export const getBeneficialOwnerOther = async (
  req: Request,
  res: Response,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  logger.debugRequest(req, `${req.method} ${req.route.path}`);
  const isRemove: boolean = await isRemoveJourney(req);
  const appData: ApplicationData = await fetchApplicationData(req, !isRemove);

  return res.render(templateName, {
    ...appData,
    backLinkUrl,
    templateName,
    relevant_period: req.query["relevant-period"] === "true",
    FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
  });
};

export const getBeneficialOwnerOtherById = async (
  req: Request,
  res: Response,
  next: NextFunction,
  templateName: string,
  backLinkUrl: string
): Promise<void> => {

  try {

    logger.debugRequest(req, `GET BY ID ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const id = req.params[ID];
    const data = await getFromApplicationData(req, BeneficialOwnerOtherKey, id, true);
    const principalAddress = data ? mapDataObjectToFields(data[PrincipalAddressKey], PrincipalAddressKeys, AddressKeys) : {};
    const serviceAddress = data ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const startDate = data ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    const templateOptions = {
      id,
      ...data,
      ...principalAddress,
      ...serviceAddress,
      backLinkUrl,
      templateName: `${templateName}/${id}`,
      [StartDateKey]: startDate,
      entity_name: appData.entity_name,
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    };

    if (!isRemove) {
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

export const postBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const data: ApplicationDataType = await setBeneficialOwnerData(req.body, uuidv4());
    const session = req.session as Session;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await setApplicationData(req, data, BeneficialOwnerOtherKey);
    } else {
      await setApplicationData(session, data, BeneficialOwnerOtherKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const session = req.session as Session;
    const id = req.params[ID];
    const boData: BeneficialOwnerOther = await getFromApplicationData(req, BeneficialOwnerOtherKey, id, true);
    const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];
    await removeFromApplicationData(req, BeneficialOwnerOtherKey, id, appData);
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, id);

    if (trustIds.length > 0) {
      (data as BeneficialOwnerOther).trust_ids = [...trustIds];
    }

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await setApplicationData(req, data, BeneficialOwnerOtherKey);
    } else {
      await setApplicationData(session, data, BeneficialOwnerOtherKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerOther = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const session = req.session as Session;
    await removeFromApplicationData(req, BeneficialOwnerOtherKey, req.params[ID], appData);

    if (!isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) || isRemove) {
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerOtherKeys);

  data[PrincipalAddressKey] = mapFieldsToDataObject(reqBody, PrincipalAddressKeys, AddressKeys);

  data[HasSamePrincipalAddressKey] = data[HasSamePrincipalAddressKey] ? +data[HasSamePrincipalAddressKey] : '';
  data[ServiceAddressKey] = !data[HasSamePrincipalAddressKey]
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  data[CeasedDateKey] = reqBody["is_still_bo"] === '0' ? mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys) : {};

  setBoNocDataAsArrays(data);

  data[IsOnSanctionsListKey] = data[IsOnSanctionsListKey] ? +data[IsOnSanctionsListKey] : '';
  data[IsOnRegisterInCountryFormedInKey] = data[IsOnRegisterInCountryFormedInKey] ? +data[IsOnRegisterInCountryFormedInKey] : '';

  if (!data[IsOnRegisterInCountryFormedInKey]) {
    data[PublicRegisterNameKey] = "";
    data[RegistrationNumberKey] = "";
  }
  data[ID] = id;

  return data;
};
