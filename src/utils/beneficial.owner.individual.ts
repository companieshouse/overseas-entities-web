import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../utils/logger";
import * as config from "../config";
import { saveAndContinue } from "../utils/save.and.continue";
import { isActiveFeature } from "./feature.flag";
import { isRemoveJourney } from "./url";
import { addCeasedDateToTemplateOptions } from "../utils/update/ceased_date_util";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { ApplicationDataType, ApplicationData } from "../model";

import {
  prepareData,
  setApplicationData,
  setBoNocDataAsArrays,
  fetchApplicationData,
  mapDataObjectToFields,
  mapFieldsToDataObject,
  getFromApplicationData,
  removeFromApplicationData,
} from "../utils/application.data";

import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKey,
  BeneficialOwnerIndividualKeys,
} from "../model/beneficial.owner.individual.model";

import {
  ID,
  AddressKeys,
  InputDateKeys,
  EntityNumberKey,
  IsOnSanctionsListKey,
  HasSameResidentialAddressKey,
} from "../model/data.types.model";

import {
  ServiceAddressKey,
  ServiceAddressKeys,
  UsualResidentialAddressKey,
  UsualResidentialAddressKeys,
} from "../model/address.model";

import {
  StartDateKey,
  StartDateKeys,
  CeasedDateKey,
  CeasedDateKeys,
  DateOfBirthKey,
  DateOfBirthKeys,
  HaveDayOfBirthKey,
} from "../model/date.model";

export const getBeneficialOwnerIndividual = async (
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

export const getBeneficialOwnerIndividualById = async (
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
    const data = await getFromApplicationData(req, BeneficialOwnerIndividualKey, id, true);
    const usualResidentialAddress = data ? mapDataObjectToFields(data[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    const serviceAddress = data ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const dobDate = data ? mapDataObjectToFields(data[DateOfBirthKey], DateOfBirthKeys, InputDateKeys) : {};
    const startDate = data ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    const templateOptions = {
      ...data,
      ...usualResidentialAddress,
      ...serviceAddress,
      id,
      backLinkUrl,
      [DateOfBirthKey]: dobDate,
      [StartDateKey]: startDate,
      entity_name: appData.entity_name,
      templateName: `${templateName}/${id}`,
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

export const postBeneficialOwnerIndividual = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const session = req.session as Session;
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());
    data[HaveDayOfBirthKey] = true;

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await setApplicationData(req, data, BeneficialOwnerIndividualKey);
    } else {
      await setApplicationData(session, data, BeneficialOwnerIndividualKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerIndividual = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const session = req.session as Session;
    const id = req.params[ID];
    const boData: BeneficialOwnerIndividual = await getFromApplicationData(req, BeneficialOwnerIndividualKey, id, true);
    const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];
    await removeFromApplicationData(req, BeneficialOwnerIndividualKey, id, appData);
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, id);

    if (trustIds.length > 0) {
      (data as BeneficialOwnerIndividual).trust_ids = [...trustIds];
    }

    if (isActiveFeature(config.FEATURE_FLAG_ENABLE_REDIS_REMOVAL) && !isRemove) {
      await setApplicationData(req, data, BeneficialOwnerIndividualKey);
    } else {
      await setApplicationData(session, data, BeneficialOwnerIndividualKey);
      await saveAndContinue(req, session);
    }

    return res.redirect(nextPage);

  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerIndividual = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {

  try {

    logger.debugRequest(req, `REMOVE ${req.route.path}`);
    const isRemove: boolean = await isRemoveJourney(req);
    const appData: ApplicationData = await fetchApplicationData(req, !isRemove);
    const session = req.session as Session;
    await removeFromApplicationData(req, BeneficialOwnerIndividualKey, req.params[ID], appData);

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
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerIndividualKeys);
  data[UsualResidentialAddressKey] = mapFieldsToDataObject(reqBody, UsualResidentialAddressKeys, AddressKeys);
  data[HasSameResidentialAddressKey] = data[HasSameResidentialAddressKey] ? +data[HasSameResidentialAddressKey] : '';
  data[ServiceAddressKey] = !data[HasSameResidentialAddressKey] ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys) : {};
  data[DateOfBirthKey] = mapFieldsToDataObject(reqBody, DateOfBirthKeys, InputDateKeys);
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  data[CeasedDateKey] = reqBody["is_still_bo"] === '0' ? mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys) : {};

  setBoNocDataAsArrays(data);

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';
  data[ID] = id;

  return data;
};
