import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

import { getApplicationData, getFromApplicationData, mapDataObjectToFields, mapFieldsToDataObject, prepareData, removeFromApplicationData, setApplicationData } from "../utils/application.data";
import { addCeasedDateToTemplateOptions } from "../utils/update/ceased_date_util";
import { saveAndContinue } from "../utils/save.and.continue";
import { ApplicationDataType, ApplicationData } from "../model";
import { logger } from "../utils/logger";
import {
  BeneficialOwnerIndividual,
  BeneficialOwnerIndividualKey,
  BeneficialOwnerIndividualKeys
} from "../model/beneficial.owner.individual.model";
import {
  AddressKeys,
  BeneficialOwnerNoc,
  EntityNumberKey,
  HasSameResidentialAddressKey,
  ID,
  InputDateKeys,
  IsOnSanctionsListKey,
  NonLegalFirmControlNoc,
  NonLegalFirmNoc,
  OwnerOfLandOtherEntityJurisdictionsNoc,
  OwnerOfLandPersonJurisdictionsNoc,
  TrustControlNoc,
  TrusteesNoc
} from "../model/data.types.model";
import {
  ServiceAddressKey,
  ServiceAddressKeys,
  UsualResidentialAddressKey,
  UsualResidentialAddressKeys,
} from "../model/address.model";
import {
  CeasedDateKey,
  CeasedDateKeys,
  DateOfBirthKey,
  DateOfBirthKeys,
  HaveDayOfBirthKey,
  StartDateKey,
  StartDateKeys
} from "../model/date.model";
import { v4 as uuidv4 } from "uuid";
import * as config from "../config";
import { addActiveSubmissionBasePathToTemplateData } from "./template.data";
import { isActiveFeature } from "./feature.flag";

export const getBeneficialOwnerIndividual = (req: Request, res: Response, templateName: string, backLinkUrl: string) => {
  logger.debugRequest(req, `${req.method} ${req.route.path}`);

  const appData: ApplicationData = getApplicationData(req.session);

  return res.render(templateName, {
    backLinkUrl: backLinkUrl,
    templateName: templateName,
    ...appData,
    relevant_period: req.query["relevant-period"] === "true",
    FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
  });
};

export const getBeneficialOwnerIndividualById = (req: Request, res: Response, next: NextFunction, templateName: string, backLinkUrl: string) => {
  try {
    logger.debugRequest(req, `GET BY ID ${req.route.path}`);

    const appData = getApplicationData(req.session);

    const id = req.params[ID];
    const data = getFromApplicationData(req, BeneficialOwnerIndividualKey, id, true);

    const usualResidentialAddress = (data) ? mapDataObjectToFields(data[UsualResidentialAddressKey], UsualResidentialAddressKeys, AddressKeys) : {};
    const serviceAddress = (data) ? mapDataObjectToFields(data[ServiceAddressKey], ServiceAddressKeys, AddressKeys) : {};
    const dobDate = (data) ? mapDataObjectToFields(data[DateOfBirthKey], DateOfBirthKeys, InputDateKeys) : {};
    const startDate = (data) ? mapDataObjectToFields(data[StartDateKey], StartDateKeys, InputDateKeys) : {};

    const templateOptions = {
      backLinkUrl: backLinkUrl,
      templateName: `${templateName}/${id}`,
      id,
      ...data,
      ...usualResidentialAddress,
      ...serviceAddress,
      [DateOfBirthKey]: dobDate,
      [StartDateKey]: startDate,
      entity_name: appData.entity_name,
      FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC: isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)
    };

    // Redis removal work - Add extra template options if Redis Remove flag is true and on Registration journey
    const isRegistration: boolean = req.path.startsWith(config.LANDING_URL);
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

export const postBeneficialOwnerIndividual = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `${req.method} ${req.route.path}`);

    const session = req.session as Session;
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, uuidv4());
    data[HaveDayOfBirthKey] = true;

    setApplicationData(session, data, BeneficialOwnerIndividualKey);

    await saveAndContinue(req, session);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const updateBeneficialOwnerIndividual = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `UPDATE ${req.route.path}`);

    const id = req.params[ID];
    const boData: BeneficialOwnerIndividual = getFromApplicationData(req, BeneficialOwnerIndividualKey, id, true);

    const trustIds: string[] = boData?.trust_ids?.length ? [...boData.trust_ids] : [];

    // Remove old Beneficial Owner
    removeFromApplicationData(req, BeneficialOwnerIndividualKey, id);

    // Set Beneficial Owner data
    const data: ApplicationDataType = setBeneficialOwnerData(req.body, id);

    if (trustIds.length > 0) {
      (data as BeneficialOwnerIndividual).trust_ids = [...trustIds];
    }

    const session = req.session as Session;

    // Save new Beneficial Owner
    setApplicationData(session, data, BeneficialOwnerIndividualKey);

    await saveAndContinue(req, session);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const removeBeneficialOwnerIndividual = async (req: Request, res: Response, next: NextFunction, nextPage: string): Promise<void> => {
  try {
    logger.debugRequest(req, `REMOVE ${req.route.path}`);

    removeFromApplicationData(req, BeneficialOwnerIndividualKey, req.params[ID]);
    const session = req.session as Session;

    await saveAndContinue(req, session);

    return res.redirect(nextPage);
  } catch (error) {
    logger.errorRequest(req, error);
    next(error);
  }
};

export const setBeneficialOwnerData = (reqBody: any, id: string): ApplicationDataType => {
  const data: ApplicationDataType = prepareData(reqBody, BeneficialOwnerIndividualKeys);

  data[UsualResidentialAddressKey] = mapFieldsToDataObject(reqBody, UsualResidentialAddressKeys, AddressKeys);
  data[HasSameResidentialAddressKey] = (data[HasSameResidentialAddressKey]) ? +data[HasSameResidentialAddressKey] : '';
  data[ServiceAddressKey] = (!data[HasSameResidentialAddressKey])
    ? mapFieldsToDataObject(reqBody, ServiceAddressKeys, AddressKeys)
    : {};
  data[DateOfBirthKey] = mapFieldsToDataObject(reqBody, DateOfBirthKeys, InputDateKeys);
  data[StartDateKey] = mapFieldsToDataObject(reqBody, StartDateKeys, InputDateKeys);
  data[CeasedDateKey] = reqBody["is_still_bo"] === '0' ? mapFieldsToDataObject(reqBody, CeasedDateKeys, InputDateKeys) : {};

  // It needs concatenations because if in the check boxes we select only one option
  // nunjucks returns just a string and with concat we will return an array.
  data[BeneficialOwnerNoc] = (data[BeneficialOwnerNoc]) ? [].concat(data[BeneficialOwnerNoc]) : [];
  data[TrusteesNoc] = (data[TrusteesNoc]) ? [].concat(data[TrusteesNoc]) : [];

  // Should be able to move this into an else on the feature flag if statement below when we apply new nocs to update journey
  data[NonLegalFirmNoc] = (data[NonLegalFirmNoc]) ? [].concat(data[NonLegalFirmNoc]) : [];

  if (isActiveFeature(config.FEATURE_FLAG_ENABLE_PROPERTY_OR_LAND_OWNER_NOC)) {
    data[TrustControlNoc] = data[TrustControlNoc] ? [].concat(data[TrustControlNoc]) : [];
    data[NonLegalFirmControlNoc] = data[NonLegalFirmControlNoc] ? [].concat(data[NonLegalFirmControlNoc]) : [];
    data[OwnerOfLandPersonJurisdictionsNoc] = data[OwnerOfLandPersonJurisdictionsNoc] ? [].concat(data[OwnerOfLandPersonJurisdictionsNoc]) : [];
    data[OwnerOfLandOtherEntityJurisdictionsNoc] = data[OwnerOfLandOtherEntityJurisdictionsNoc] ? [].concat(data[OwnerOfLandOtherEntityJurisdictionsNoc]) : [];
  }

  data[IsOnSanctionsListKey] = (data[IsOnSanctionsListKey]) ? +data[IsOnSanctionsListKey] : '';

  data[ID] = id;

  return data;
};
